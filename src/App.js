import React from 'react';
import './App.css';

import AchievementViewTabs from './AchievementViewTabs'
import AchievementSelector from './AchievementSelector'

import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import 'bootstrap/dist/css/bootstrap.min.css';

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
        achieveViewRef: React.createRef() // TODO: Does this really need to be in state?
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
              selectAchievement={this.state.achieveViewRef}
              playerAchieves={this.state.achieves}
              />
          </Col>
          <Col>
            <AchievementViewTabs
              ref={this.state.achieveViewRef}
              achieves={this.state.achieves}/>
          </Col>
        </Row>


        </Container>
      </div>
    );
  }
}

export default App;
