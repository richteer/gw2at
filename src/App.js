import React from 'react';
import './App.css';

import AchievementViewTabs from './AchievementViewTabs'
import AchievementSelector from './AchievementSelector'

import Alert from 'react-bootstrap/Alert'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import 'bootstrap/dist/css/bootstrap.min.css';

const api_root = "https://api.guildwars2.com"

class App extends React.Component {
  constructor(props) {
    super(props);


      this.state = {
        error: "Hi! Set an API key above, and complain to me later when it's not there after a page refresh",
        achieves: {},
        lastUpdate: 0,
        apikey: null,
        darkTheme: false,
        achieveViewRef: React.createRef() // TODO: Does this really need to be in state?
      }

      //this.state.achieves = this.state.tracked.map(e => ({"id":e, "current": 0}))

      this.apiKeyRef = React.createRef()
  }

  componentDidMount() {
    // Retrieve the API key from the cookie and set it here
    var apikey = localStorage.getItem("apikey")
    var darkTheme = localStorage.getItem("darktheme")
    if (apikey) {
      this.apiKeyRef.current.value = apikey
      this.updateApiKey(apikey)
    }
    
    if(darkTheme === "true"){
      this.setState({darkTheme: true})
    }
  }

  updateAchievementData(data) {
    console.log("Updating achievement data")
    //console.log(data)
    // Do I actually need to do anything here?
    
    var newdata = {}
    data.forEach(d => {newdata[d.id] = d})

    this.setState({"achieves": newdata, lastUpdate: Date.now()})
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
          this.setState({
            error: `${result.status} ${result.statusText}`,
            apikey: null
          })
          this.setAutoUpdate(0) // Cancel any auto-update features
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
    this.clearError()

    // Sure hope this never has to be debugged...
    if (!this.apiKeyRef.current.value.match(
      /([\dA-F]{8}-([\dA-F]{4}-){3}[\dA-F]{12}){2}/i
      )) {
      this.setState({error: "Invalid API key format, should look like: " +
        "00000000-AAAA-1234-8675-01189998819991197253-6969-0420-EEEE-DEADBEEFCAFE"
      })
      return
    }

    this.setState({apikey: this.apiKeyRef.current.value}, () => {
      localStorage.setItem("apikey", this.state.apikey)
      this.getAchievementData(this.state.apikey, [])
    })
  }

  setAutoUpdate(minutes) {
    minutes = parseInt(minutes)
    clearInterval(this.autoUpdateInterval)
    this.setState({autoUpdateEnabled: false})

    // Special case to cancel current timer
    if (minutes === 0) {
      console.log("Cancelling update timer")
      return
    }

    this.autoUpdateInterval = setInterval(this.autoUpdateFunc(minutes).bind(this), 1000)

    // For now, kill all auto-updaters after a day
    setTimeout(() => clearInterval(this.autoUpdateInterval), 24 * 60 * 1000)

    this.setState({autoUpdateEnabled: true, nextUpdateCountDown: minutes * 60})
  }

  autoUpdateFunc(minutes) {
    return function() {
      var nextUpdate = this.state.lastUpdate + (minutes * 60 * 1000)
      if (Date.now() >= nextUpdate) {
        this.getAchievementData(this.state.apikey, [])
      }

      nextUpdate -= Date.now()            // Remaining ms
      nextUpdate /= 1000                  // Remaining seconds
      nextUpdate = Math.ceil(nextUpdate)  // Remaining seconds as integer
      if (nextUpdate < 0)                 // Don't bother with negatives
        nextUpdate = 0

      this.setState((state) => ({nextUpdateCountDown: nextUpdate}))
    }
  }

  clearError() {
    this.setState({"error" : ""})
  }

  toogleDarkTheme(){
    this.setState({darkTheme: !this.state.darkTheme}, () => {
      localStorage.setItem("darktheme", this.state.darkTheme)
    })
  }

  render() {
    return (
      <div className={`App ${(this.state.darkTheme) ? "dark-invert" : "\u1F319"}`}>
        <div style={{flexShrink: 0}}>
          <Navbar bg="dark" variant="dark" className={`${(this.state.darkTheme) ? "dark-invert" : ""}`}>
            <Navbar.Brand>GW2AT</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                <InputGroup>
                  <FormControl
                    placeholder="API Key with achievements permission"
                    ref={this.apiKeyRef}
                    style={{width: "680px"}}
                  />
                  <InputGroup.Append>
                    <Button variant="primary" onClick={this.updateApiKey.bind(this)}>Update</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Navbar.Text>

              <NavDropdown title="Auto-update" id="auto-update-api"
                  onSelect={(k) => this.setAutoUpdate(k)}>
                <NavDropdown.Item eventKey={10}>10 minutes</NavDropdown.Item>
                <NavDropdown.Item eventKey={5}>5 minutes</NavDropdown.Item>
                <NavDropdown.Item eventKey={1}>1 minute</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item eventKey={0}>Cancel</NavDropdown.Item>
              </NavDropdown>

              <Navbar.Text hidden={!this.state.autoUpdateEnabled}>
                <span>
                  Next update: {this.state.nextUpdateCountDown}s
                </span>
              </Navbar.Text>

            </Navbar.Collapse>
            <div className="dark-toggle" onClick={this.toogleDarkTheme.bind(this)}>
              {(this.state.darkTheme) ?  "\u{1F319}" : "\u{1f506}"}
            </div>
          </Navbar>
          <Alert
            variant="danger"
            show={!!this.state.error}
            onClose={this.clearError.bind(this)}
            dismissible
            className={`${(this.state.darkTheme) ? "dark-invert" : ""}`}
            >
            {this.state.error}
          </Alert>
        </div>

          <div className="app-window">
            <AchievementSelector
              selectAchievement={this.state.achieveViewRef}
              playerAchieves={this.state.achieves}
              />
            <AchievementViewTabs
              ref={this.state.achieveViewRef}
              achieves={this.state.achieves}/>
          </div>

      </div>
    );
  }
}

export default App;
