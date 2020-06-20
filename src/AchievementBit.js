import React from 'react'

import ItemWithTooltip from './ItemWithTooltip'

import item_data from './item_data.json'

function getItem(id, type) {
    if (type === "Item") {
        if(item_data[id] == undefined){
            // cache item
        }
        return item_data[id]
    }

    return undefined
}

class AchivementBit extends React.Component {
	render() {
        if(this.props.bit.type === "Text"){
            return (
                <div className="ach-bit-text">
                    {this.props.bit.text}
                </div>
            )
        }

        if(this.props.bit.type === "Item" && getItem(this.props.bit.id, this.props.bit.type) != undefined){
            // get item data from id
            return (
                <ItemWithTooltip
                    item={getItem(this.props.bit.id, this.props.bit.type)}
                    size={24}/>
            )
        }

        return(
            <div></div>
        )

	}
}

export default AchivementBit