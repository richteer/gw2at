const api_root = "https://api.guildwars2.com"

class GW2API {
  constructor() {
    // Cached API data
    //  API (eg "items") -> data list (id -> object)
    this._cache = {
      achievements: {},
      items: {},
    }
  }

  // Make the raw API call. Does NOT handle caching. Helper functions should handle caching
  //  path: api path string, starting with /
  //  params: optional array of [name, value] tuples. empty if unused
  //   ->: API data from the call
  // TODO: Probably return an error state with this, especially for 206 Partial.
  async makeAPICall(path, params) {
    // Awful param formatting, maybe this is trash
    if (params.length !== 0) {
      params = "?" + params.map(elem => elem.join("=")).join("&");
    } else {
      params = "";
    }

    var url = api_root + path + params;
    console.log("fetching URL: " + url);
    var resp = await fetch(url)
      .catch(error => {
          console.log("ugh debug this later")
          console.log(error)
        }
      )
    ;

    if (!resp.ok) {
      console.log(`API returned ${resp.status}: ${resp.statusText}`);
      console.log(`body: ${await resp.body}`)
    }

    return await resp.json();
  }

  // TODO: UPDATE REWRITE CACHEIFY
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
          console.log(`Fetched Account Achievement API data successfully - ${result.statusText}`)
          
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

  // Get Item data
  //  itemId: id of the Item
  //  type: string type of the item. Can be one of "Item", "Skin", "Minipet".
  async getItem(itemId, type){
    var url = "";
    var itemInfo = this._cache.items[itemId];

    if (itemInfo) {
      return itemInfo;
    }

    switch(type) {
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
        console.log("UNDEFINED TYPE: " + type);
        return undefined;
    }
    
    console.log("getting item from: " + url);
    itemInfo = await this.makeAPICall(url, []);
    this._cache.items[itemId] = itemInfo;

    return itemInfo
  }

  // TODO: UPDATE REWRITE CACHEIFY
  // Holy crap I hate async. We should really break these functions apart somehow and make them much nicer
  async getAchievementGroups() {
    var url = api_root + "/v2/achievements/groups?ids=all"
    var groups

    await fetch(url)
    .then(result => {
      if (result.ok) {
        console.log(`Fetched Achievement Group API data successfully - ${result.statusText}`)
        
        groups = result.json()
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

    if (groups === undefined) {
      console.log("groups was undefined")
      return []
    }

    return groups
  }

  // TODO: UPDATE REWRITE CACHEIFY
  async getAchievementCategories(ids) {
    if (!ids) ids="all"
    else ids = ids.join(",")

    var url = api_root + "/v2/achievements/categories?ids=" + ids
    var categories

    await fetch(url)
    .then(result => {
      if (result.ok) {
        console.log(`Fetched Achievement Category API data successfully - ${result.statusText}`)
        
        categories = result.json()
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

    if (categories === undefined) {
      return []
    }

    return await categories
  }

  // Get a list of achievement ids. Batches into one call, to save on API traffic
  //  ids: Array of achievement ids to fetch.
  //   ->: Array of achievement data objects
  // TODO: Handle partial cache hits
  // TODO: Handle partial API return (206)
  async getAchievements(ids) {
    var temp = ids.map(e => this._cache.achievements[e]).filter(e => e);
    // TODO: Only do full cache hit for now
    if (temp.length === ids.length) {
      console.log("full cache hit");
      return temp;
    }

    ids = ids.join(",")
    var achievements = await this.makeAPICall("/v2/achievements", [["ids", ids]]);

    if (achievements === undefined) {
      return []
    }

    achievements.forEach(e => this._cache.achievements[e.id] = e);

    return await achievements;
  }

  // Get a single achievement object
  //  id: id number of the achievement to fetch
  async getAchievement(id) {
    var ret = this._cache.achievements[id];
    if (ret) {
      console.log("cache hit!");

      return ret;
    }

    // NOTE: this may do really funny things if the achievement doesn't exist
    // TODO: actually error check this?
    ret = await this.makeAPICall("/v2/achievements", [["id", id]])
    this._cache.achievements[id] = ret;

    return ret;
  }

}

const instance = new GW2API();
Object.freeze(instance);

export default instance;
