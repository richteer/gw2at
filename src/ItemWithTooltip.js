import React from 'react'

import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'

/*
const rarity_map = {
	"Junk": "#AAA",
	"Basic": "#000",
	"Fine": "#62A4DA",
	"Masterwork": "#1a9306",
	"Rare": "#fcd00b",
	"Exotic": "#ffa405",
	"Ascended": "#fb3e8d",
	"Legendary": "#4C139D"
}
const rarity_map = {
	"Legendary": "linear-gradient(to bottom,#9152fd 50%,#222 100%)",
	"Ascended": "linear-gradient(to bottom,#cc477e 50%,#222 100%)",
	"Exotic": "linear-gradient(to bottom,#ffa405 50%,#222 100%)",
	"Rare": "linear-gradient(to bottom,#fcd00b 50%,#222 100%)",
	"Masterwork": "linear-gradient(to bottom,#42a435 50%,#222 100%)",
	"Fine": "linear-gradient(to bottom,#648ec8 50%,#222 100%)",
	"Basic": "linear-gradient(to bottom,#FFF 50%,#222 100%)",
	"Junk": "linear-gradient(to bottom,#AAA 50%,#222 100%)",
}
*/

//import {soi_icon} from "./SOI"
//const noIcon = "data:image/png;base64, " + soi_icon


const rarity_map = {
		"Legendary": "#9152fd",
		"Ascended": "#cc477e",
		"Exotic": "#ffa405",
		"Rare": "#fcd00b",
		"Masterwork": "#42a435",
		"Fine": "#648ec8",
		"Basic": "#FFF",
		"Junk": "#AAA",
	}
	

class IconWithTooltip extends React.Component {
	render() {
		
		return (
			<OverlayTrigger
				placement="bottom"
				delay={{ show: 250, hide: 400 }}
				overlay={
					<Popover id="popover-basic">
						<Popover.Title>
							<img 
								src={this.props.item.icon}
								width={32}
								height={32}
								style={{borderRadius: "20%", border: `2px solid ${rarity_map[this.props.item.rarity]}`}}
								alt={this.props.item.name}/>
							{this.props.item.name}
						</Popover.Title>
						<Popover.Content>
							{
							this.props.item.description?
							<div dangerouslySetInnerHTML={{ __html: this.props.item.description
									.replace(/\n/,"<br/>")
									.replace(/<c=@flavor>/,"<br/><br/><i>")
									.replace(/<\/c>/, "</i>")
								}}>
							</div>
							:
							<div></div>
							}
						</Popover.Content>
					</Popover>
				}
				>
				<img
					src={this.props.item.icon}
					width={this.props.size}
					height={this.props.size}
					alt={this.props.item.name}
					style={(this.props.grey) ? 
						{ filter: `grayscale(80%)`, borderRadius: "50%" }
						: { 
								borderRadius: "20%",
								border: `2px solid ${rarity_map[this.props.item.rarity]}`
							}}/>
			</OverlayTrigger>
		)
	}
}

export default IconWithTooltip