const api_root = "https://api.guildwars2.com"

class GW2API {
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

  static async getItem(itemId, type){
    var url = api_root
    var itemInfo

    switch(type){
      case "Item":
        url += "/v2/items/" + itemId
        break
      case "Skin":
        url += "/v2/skins/" + itemId
        break
      case "Minipet":
        url += "/v2/minis/" + itemId
        break
      default:
        break
    }
    

    await fetch(url)
      .then(result => {
        // TODO: Check for 206 here
        if (result.ok) {
          console.log(`Fetched API data successfully - ${result.statusText}`)
          
          itemInfo = result.json()
        }
        else {
          console.log(result)
        }        
      })
      .catch(error => {
          console.log("ugh debug this later")
          console.log(error)
        }
      )

    return itemInfo
  }

}

export default GW2API