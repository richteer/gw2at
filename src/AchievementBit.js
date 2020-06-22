import React from 'react'

import ItemWithTooltip from './ItemWithTooltip'

import GW2API from "./GW2API"
import './AchievementBit.css'

var item_data = {}
var skin_data = {}
var mini_data = {}

function getItem(id, type) {
  // TODO: get the other types of items (skin, mini...)
  var cached = false
  
  if ((type === "Item" && item_data[id] !== undefined)
      ||(type === "Skin" && skin_data[id] !== undefined)
      ||(type === "Minipet" && mini_data[id] !== undefined)) 
  {
    cached = true
  }

  if(!cached){
    GW2API.getItem(id, type).then(
      (itemInfo) => {
        if(itemInfo !== undefined){
          switch(type){
            case "Item":
              item_data[itemInfo.id] = itemInfo
              break
            case "Skin":
              skin_data[itemInfo.id] = itemInfo
              break
            case "Minipet":
              mini_data[itemInfo.id] = itemInfo
              break
            default:
              break
          }
        }
      }
    )
  }
}

class AchivementBit extends React.Component {
  render() {
    if(this.props.data.type === "Text"){
      return (
        <div className={"ach-bit-text" + (this.props.done ? " ach-bit-text-done" : "")}>
          {this.props.data.text}
        </div>
      )
    }
      
      if(this.props.data.type === "Item" || this.props.data.type === "Skin" || this.props.data.type === "Minipet"){
        getItem(this.props.data.id, this.props.data.type)
        var item = this.props.data.type === "Item" ? item_data[this.props.data.id] : (this.props.data.type === "Skin" ? skin_data[this.props.data.id] : mini_data[this.props.data.id])

        if(item !== undefined){
          return (
            <div className="ach-bit-item">
              {
                this.props.done?
                  <ItemWithTooltip
                      item={item}
                      size={40}/>
                  :
                  <ItemWithTooltip
                      item={item}
                      size={40}
                      grey/>
              }
            </div>
          )
        }
      }

      return(
        <div></div>
      )
          
    }
  }
      
export default AchivementBit