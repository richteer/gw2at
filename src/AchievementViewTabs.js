import React from 'react'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import AchievementView from './AchievementView'

import GW2API from './GW2API'

import './NewTab.css'

// Table of sort functions to use
// Each should take in achievement progress and data, and return a function
//  that sorts accordingly over achievement ID values
const sortfuncs = {
	progress: sortByProgress,
	name: sortByName
}

// Sorts by achievement progress % complete
//   Sorts closer-to-complete achievements at the top by default
function sortByProgress(ach_data, ach_prog) {
	return (a,b) => {
		var ta = ach_prog[a]
		var tb = ach_prog[b]

		// We may have no progress data yet, so filter those accordingly
		if (!ta) return 1;
		if (!tb) return -1;

		return (tb.current / tb.max) - (ta.current / ta.max)
	}
}

function sortByName(ach_data, ach_prog) {
	return (a,b) => {
		return ach_data[a].name.localeCompare(ach_data[b].name)
	}
}


class TabsOptionsNav extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			showRename: false
		}

		this.renameRef = React.createRef()
	}

	render() {
		return (
			<Nav hidden={this.props.show}>
				<NavDropdown
											title="Sort by"
											id={`nav-sort-${this.props.tab}`}
											onSelect={(e) =>
												// I hate this.
												this.props.sortTab(this.props.tab, sortfuncs[e.slice(1)], !!(e[0]==="-"))
											}>
					<NavDropdown.Item eventKey="+progress">Progress Desc</NavDropdown.Item>
					<NavDropdown.Item eventKey="-progress">Progress Asc</NavDropdown.Item>
					<NavDropdown.Divider />
					<NavDropdown.Item eventKey="+name">Name A-Z</NavDropdown.Item>
					<NavDropdown.Item eventKey="-name">Name Z-A</NavDropdown.Item>
				</NavDropdown>
				<NavDropdown
										title="Untrack..."
										id={`nav-untrack-${this.props.tab}`}
										>
					<NavDropdown.Item
										eventKey={`ev-clear-${this.props.tab}`}
										onSelect={() => this.props.clearCompleted(this.props.tab)}>
						Completed
					</NavDropdown.Item>
					<NavDropdown.Divider/>
					<NavDropdown.Item
							className="nav-danger-item"
							onSelect={() => this.props.removeAll(this.props.tab)}>
						All
					</NavDropdown.Item>
				</NavDropdown>
				<Nav.Item>
					<Nav.Link eventKey={`ev-rename-${this.props.tab}`}
										onSelect={() => {
												if (this.state.showRename) return
												this.setState((state) => ({showRename: !state.showRename}))
											}
										}>
						<span hidden={this.state.showRename}>
							Rename Tab
						</span>
						<InputGroup hidden={!this.state.showRename}>
                <FormControl
									placeholder="New Tab Name"
									ref={this.renameRef}
                />
                <InputGroup.Append>
                  <Button variant="primary" onClick={() => {
											this.props.renameTab(this.props.tab, this.renameRef.current.value)
											this.setState({showRename: false})
										}
									}>Rename</Button>
									<Button variant="secondary" onClick={() => this.setState((state) => ({showRename: false}))}>Cancel</Button>
                </InputGroup.Append>
              </InputGroup>
					</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link eventKey={`ev-remove-${this.props.tab}`}
										onSelect={() => this.props.removeTab(this.props.tab)}>
						Remove Tab
					</Nav.Link>
				</Nav.Item>
			</Nav>
		)
	}
}


class AchievementViewTabs extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			activeTab: "Main",
			tabs: {
				Main: [
						5327,
						5312,
						5319,
						5298
				],
				Repeatables: [
						5338,
						5278,
						5334,
						5286
					]
			},
			showTabNav: false
		}

		this.addTabRef = React.createRef()

	}

	componentDidMount() {
		this.loadStateFromStorage();
	}

  addTab(e) {
		if (!this.addTabRef.current.value) {
			return;
		}

    this.setState(state => {
      var newtabs = {
        ...state.tabs
      }
      newtabs[this.addTabRef.current.value] = []

      return {tabs: newtabs}
    }, () => (this.saveStateToStorage()))
    e.preventDefault()
  }

  renameTab(oldTab, newTab) {
		if (this.state.tabs[newTab]) {
			console.error("Duplicate name detected, rejecting rename")
			console.error("TODO: display this error to a user")
			return
		}

		this.setState((state) => {
			var {[oldTab]: oldData, ...rest} = state.tabs

			return {
				tabs: {[newTab]: oldData, ...rest},
				activeTab: newTab,
			}
		}, () => this.saveStateToStorage())
	}

  removeTab(e) {
    this.setState(state => {
      var newtabs = {}
      Object.entries(this.state.tabs).filter(tab => tab[0] !== e).forEach(tab => {newtabs[tab[0]] = tab[1]})

      return {tabs: newtabs}
    }, () => (this.saveStateToStorage()))
	}

	// TODO: This whole sorting logic desperately needs to be optimized
	sortTab(tab, sortfunc, reverse) {
		this.setState(state => {
			var tabs = state.tabs
			var curr = tabs[tab]

			// TODO: Don't directly rely on cached data...
			curr.sort(sortfunc(GW2API._cache.achievements, this.props.achieves))
			if (reverse) curr.reverse()

			tabs[tab] = curr
			return {tabs: tabs}
		})
	}

	clearCompleted(tab) {
		this.setState((state) => {
			var tabs = state.tabs
			var curr = tabs[tab]

			curr = curr.filter(a => !this.props.achieves[a]?.done)
			tabs[tab] = curr

			return {tabs: tabs}
		}, () => (this.saveStateToStorage()))
	}

	// TODO: probably unify all deleting methods with a single function
	//   that takes in a filter func
	removeAll(tab) {
		this.setState((state) => {
			var tabs = state.tabs

			tabs[tab] = []

			return {tabs: tabs}
		}, () => (this.saveStateToStorage()))
	}

	selectAchievement(ach_id) {
    this.setState(state => {
        const tmp = state.tabs[state.activeTab]
        // Don't add if tab doesn't exist or if achievement already tracked in this tab
        if (tmp === undefined || tmp.indexOf(ach_id) >= 0) {
          return {}
        }
        var tracked = [...tmp, ach_id]
        var newtabs = {
          ...state.tabs,
        }
        newtabs[state.activeTab] = tracked
        return {tabs: newtabs}
    }, () => (this.saveStateToStorage())
    )
	}
	
  deselectAchievement(ach_id) {
    this.setState(state => {
      
      var remove = state.tabs[state.activeTab].indexOf(ach_id)

      if (remove < 0) {
        return {}
      }

      var tracked = [...state.tabs[state.activeTab]]
      tracked.splice(remove, 1)

      var newtabs = {
        ...state.tabs
      }
      newtabs[state.activeTab] = tracked
      return {tabs: newtabs}
    }, () => (this.saveStateToStorage())
    )
  }

	// Call this whenever updating something the user might want to keep
	saveStateToStorage() {
		localStorage.setItem("tabs", JSON.stringify(this.state.tabs))
	}

  // Call this on page load, and that's probably it
  loadStateFromStorage() {
    const newtabs = localStorage.getItem("tabs")

    if (!newtabs) {
			// Even if there's nothing in localstorage, we still want to force the cache update here
			GW2API.getAchievements(Object.values(this.state.tabs).reduce((a,b) => a.concat(b), []))
				.then(() => {
					this.forceUpdate();
				});
			return
		}


    console.log("reloading tabs from localstorage")
    this.setState({tabs: JSON.parse(newtabs)}, () => {
			GW2API.getAchievements(Object.values(this.state.tabs).reduce((a,b) => a.concat(b), []))
				.then(() => {
					this.forceUpdate();
				});
		});
  }

	render() {
		return (
			<div className="AchievementViewTabs">
				<Tabs onSelect={(e) => {
						/* This is a delicious hack...
						* Manually handle tab switching, intercept switching the options tab so it functions as a
						* button without having to do any weird layouting stuff.
						*/
						if (e === "show-tab-options") {
							this.setState((state) => ({showTabNav: !state.showTabNav}), ()=>console.log(this.state));
						}
						else {
							this.setState({activeTab: e.replace("key-", "")})
						}
					}}
					activeKey={"key-" + this.state.activeTab}
					defaultActiveKey={"key-" + Object.keys(this.state.tabs)[0]}>
					<Tab
						eventKey="show-tab-options"
						title={
								<img src="https://wiki.guildwars2.com/images/2/25/Game_menu_options_icon.png"
									alt="Show Tab Options"
									width={24} height={24}/>
						}>
					</Tab>
					{
						Object.entries(this.state.tabs).map(tab => (
						<Tab eventKey={`key-${tab[0]}`} key={`tab-${tab[0]}`} title={tab[0]}>
							{/* TODO: maybe clean these callbacks? it seems pretty...inelegant */}
							<TabsOptionsNav
								clearCompleted={this.clearCompleted.bind(this)}
								removeAll={this.removeAll.bind(this)}
								removeTab={this.removeTab.bind(this)}
								renameTab={this.renameTab.bind(this)}
								sortTab={this.sortTab.bind(this)}
								tab={tab[0]}
								show={!this.state.showTabNav}
								/>
							<AchievementView
								// TODO: PROBABLY NOT THIS. Directly accessing the cache is hella janky.
								//  The async here needs to be handled better, perhaps by setting state?
								achievements={tab[1].map(a => GW2API._cache.achievements[a]).filter(a => a)}
								current={this.props.achieves}
								deselectAchievement={this.deselectAchievement.bind(this)}
								/>
						</Tab>
					))}
					<Tab eventKey="key-new-tab" title={<div className="NewTab">+</div>}>
						<Form onSubmit={this.addTab.bind(this)}>
							<Form.Row>
								<Col>
										<Form.Control type="text" placeholder="New Tab" ref={this.addTabRef}/>
								</Col>
								<Col sm="auto" style={{display: "flex", alignItems:"left", justifyContent:"center"}}>
									<Button variant="primary" type="submit">Add</Button>
								</Col>
							</Form.Row>
						</Form>
					</Tab>
				</Tabs>
			</div>
		)
	}
}

export default AchievementViewTabs