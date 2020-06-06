import React from 'react';
import './App.css';

import AchievementView from './AchievementView'
import AchievementSelector from './AchievementSelector'

import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import 'bootstrap/dist/css/bootstrap.min.css';

import achievement_data from './achievement_data.json'

const api_root = "https://api.guildwars2.com"
/*
// TODO: CLEAN UP THESE TERRIBLE CONVERSION TABLES HOLY CRAP
const achieve_map = [
  { "ash":   [5327, 5338]},
  { "blood": [5312, 5278]},
  { "flame": [5319, 5334]},
  { "iron":  [5298, 5286]},
]

const achieve_ids_old = [
  5327, 5338,
  5312, 5278,
  5319, 5334,
  5298, 5286,
]

const achieve_ids = {
  5327: "ash",   5338: "ash",
  5312: "blood", 5278: "blood",
  5319: "flame", 5334: "flame",
  5298: "iron",  5286: "iron",
}
*/

class App extends React.Component {
  constructor(props) {
    super(props);


      this.state = {
        error: "Hi! Set an API key above, and complain to me later when it's not there after a page refresh",
        achieves: {},
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
        }
      }

      //this.state.achieves = this.state.tracked.map(e => ({"id":e, "current": 0}))

      this.apiKeyRef = React.createRef()

  }

  componentDidMount() {
    // Retrieve the API key from the cookie and set it here
    var apikey = localStorage.getItem("apikey")
    if (apikey) {
      this.apiKeyRef.current.value = apikey
      this.updateApiKey(apikey)
    }

    this.loadStateFromStorage()
  }

  updateAchievementData(data) {
    console.log("Updating achievement data")
    //console.log(data)
    // Do I actually need to do anything here?
    
    var newdata = {}
    data.forEach(d => {newdata[d.id] = d})

    this.setState({"achieves": newdata})
  }

  getAchievementData(apikey, ids) {
    var url = api_root + "/v2/account/achievements"
            + "?access_token=" + apikey
  
    if (ids.length !== 0) {
      url += "&ids=" + ids.join(",")
    }

    fetch(url)
      .then(result => {
        // TODO: Check for 206 here
        if (result.ok) {
          console.log(`Fetched API data successfully - ${result.statusText}`)
          
          result.json().then(
            (res) => (this.updateAchievementData(res))
          )
        }
        else {
          console.log(result)
          this.setState({error: `${result.status} ${result.statusText}`})
        }        
      })
      .catch(error => {
          console.log("ugh debug this later")
          console.log(error)
          this.setState({error: `actual error this time: ${error}`})
        }
      )
  }

  updateApiKey() {
    // Only do a partial update for tracked achievements after the first full pull
    /*
    if (this.state.achieves) {
      this.getAchievementData(this.apiKeyRef.current.value, this.state.tracked)
      return
    }
    */
    this.clearError()
    localStorage.setItem("apikey", this.apiKeyRef.current.value)
    this.getAchievementData(this.apiKeyRef.current.value, [])
  }

  clearError() {
    this.setState({"error" : ""})
  }

  selectAchievement(ach_id) {
    this.setState(state => {
        const tmp = state.tabs[state.activeTab]
        // Don't add if already tracked in this tab
        if (tmp.indexOf(ach_id) >= 0) {
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
    this.setState({tabs: JSON.parse(newtabs)})
  }

  render() {
    return (
      <div className="App">
        <Container fluid>

        <Row>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="API Key with achievements permission"
              ref={this.apiKeyRef}
            />
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={this.updateApiKey.bind(this)}>Update</Button>
            </InputGroup.Append>
          </InputGroup>
        </Row>
        <Alert
          variant="danger"
          show={!!this.state.error}
          onClose={this.clearError.bind(this)}
          dismissible
          >
          {this.state.error}
        </Alert>

        <Row>
          <Col sm="auto" style={{width: "400px"}}>
            <AchievementSelector
              selectAchievement={this.selectAchievement.bind(this)}
              playerAchieves={this.state.achieves}
              />
          </Col>
          <Col>
            <Tabs onSelect={(e) => this.setState({activeTab: e.replace("key-", "")})}>
            {
              Object.entries(this.state.tabs).map(tab => (
              <Tab eventKey={`key-${tab[0]}`} title={tab[0]}>
                <AchievementView
                  achievements={tab[1].map(a => achievement_data[a]).filter(a => a)}
                  current={this.state.achieves}
                  deselectAchievement={this.deselectAchievement.bind(this)}
                  />
              </Tab>
            ))}
            </Tabs>
          </Col>
        </Row>


        </Container>
      </div>
    );
  }
}

export default App;
