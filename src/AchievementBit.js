import React from 'react'

import ItemWithTooltip from './ItemWithTooltip'

import GW2API from "./GW2API"
import './AchievementBit.css'

var item_data = {}
var skin_data = {}
var mini_data = {}

class AchivementBit extends React.Component {

  constructor(){
    super()
    this.state = {item: {}}
  }

  async componentDidMount(){
    var cached  = false
    var id      = this.props.data.id
    var type    = this.props.data.type
  
    if (type === "Item" && item_data[id] !== undefined){
      cached = true
      this.setState({item : item_data[id]})
    }
    else if (type === "Skin" && skin_data[id] !== undefined){
      cached = true
      this.setState({item: skin_data[id]})
    }
    else if (type === "Minipet" && mini_data[id] !== undefined){
      cached = true
      this.setState({item: mini_data[id]})
    }

    if(!cached){
      var itemInfo = await GW2API.getItem(id, type)
      
      if(itemInfo !== undefined){
        this.setState({item: itemInfo})

        switch(type){
          case "Item":
            item_data[id] = itemInfo
            break
          case "Skin":
            skin_data[id] = itemInfo
            break
          case "Minipet":
            mini_data[id] = itemInfo
            break
          default:
            break
        }
      }
    }
  }

  render() {
    if(this.props.data.type === "Text"){
      return (
        <div className={"ach-bit-text" + (this.props.done ? " ach-bit-text-done" : "")}>
          {this.props.data.text}
        </div>
      )
    }
      
    if(this.props.data.type === "Item" || this.props.data.type === "Skin" || this.props.data.type === "Minipet"){
      return (
        <div className="ach-bit-item">
          {
            this.props.done?
              <ItemWithTooltip
                  item={this.state.item}
                  size={40}/>
              :
              <ItemWithTooltip
                  item={this.state.item}
                  size={40}
                  grey/>
          }
        </div>
      )
    }

    return(
      <div></div>
    )
  }
}
      
export default AchivementBit