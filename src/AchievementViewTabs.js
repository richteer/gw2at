import React from 'react'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
//import Row from 'react-bootstrap/Row'
import Nav from 'react-bootstrap/Nav'
import Col from 'react-bootstrap/Col'


import AchievementView from './AchievementView'

// TODO: check if these imports actually increase memory usage
import achievement_data from './achievement_data.json'

class TabsOptionsNav extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			showTabNav: false
		}
	}

	render() {
		return (
			<Nav>
				<Nav.Item>
					<Nav.Link eventKey={`ev-nav-toggle-${this.props.tab}`}
										onSelect={() =>
											this.setState((s) => ({showTabNav: !s.showTabNav}))
										}>
						<img src="https://wiki.guildwars2.com/images/2/25/Game_menu_options_icon.png"
								alt="Show Tab Options"
								width={24} height={24}/>
					</Nav.Link>
				</Nav.Item>
				<Nav.Item hidden={!this.state.showTabNav}>
					<Nav.Link eventKey={`ev-clear-${this.props.tab}`}
										onSelect={() => this.props.clearCompleted(this.props.tab)}>
						Clear Completed
					</Nav.Link>
				</Nav.Item>
				<Nav.Item hidden={!this.state.showTabNav}>
					<Nav.Link eventKey={`ev-rename-${this.props.tab}`}
										onSelect={() => this.props.renameTab(this.props.tab)}>
						Rename Tab
					</Nav.Link>
				</Nav.Item>
				<Nav.Item hidden={!this.state.showTabNav}>
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
			newTab: ""
		}

	}

	componentDidMount() {
		this.loadStateFromStorage()
	}

  onTabNameChange(e) {
    this.setState({newTab: e.target.value});
  }

  addTab(e) {
    this.setState(state => {
      var newtabs = {
        ...state.tabs
      }
      newtabs[state.newTab] = []

      return {tabs:newtabs, newTab:""}
    }, () => (this.saveStateToStorage()))
    e.preventDefault()
  }

  renameTab(e) {
  }

  removeTab(e) {
    this.setState(state => {
      var newtabs = {}
      Object.entries(this.state.tabs).filter(tab => tab[0] !== e).forEach(tab => {newtabs[tab[0]] = tab[1]})

      return {tabs:newtabs}
    }, () => (this.saveStateToStorage()))
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

    if (!newtabs)
      return

    console.log("reloading tabs from localstorage:")
    console.log(JSON.parse(newtabs))
    this.setState({tabs: JSON.parse(newtabs)}, () => console.log(this.state))
  }

	render() {
		return (
			<Tabs onSelect={(e) => this.setState({activeTab: e.replace("key-", "")})}>
				{
					Object.entries(this.state.tabs).map(tab => (
					<Tab eventKey={`key-${tab[0]}`} key={`tab-${tab[0]}`} title={tab[0]}>
						{/* TODO: maybe clean these callbacks? it seems pretty...inelegant */}
						<TabsOptionsNav
							clearCompleted={this.clearCompleted.bind(this)}
							removeTab={this.removeTab.bind(this)}
							renameTab={this.renameTab.bind(this)}
							tab={tab[0]}
							/>
						<AchievementView
							achievements={tab[1].map(a => achievement_data[a]).filter(a => a)}
							current={this.props.achieves}
							deselectAchievement={this.deselectAchievement.bind(this)}
							/>
					</Tab>
				))}
				<Tab eventKey="new_tab" title="+">
					<Form onSubmit={this.addTab.bind(this)}>
						<Form.Row>
							<Col>
									<Form.Control type="text" placeholder="New Tab" value={this.state.newTab} onChange={this.onTabNameChange.bind(this)}/>
							</Col>
							<Col sm="auto" style={{display: "flex", alignItems:"left", justifyContent:"center"}}>
								<Button variant="primary" type="submit">Add</Button>
							</Col>
						</Form.Row>
					</Form>
				</Tab>
			</Tabs>

		)
	}
}

export default AchievementViewTabs