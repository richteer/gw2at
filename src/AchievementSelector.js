import React from 'react'

import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'

import AchievementTooltip from './AchievementTooltip'
import GW2API from './GW2API'

import './AchievementSelector.css'

const mastery_points = {
	Tyria: "https://wiki.guildwars2.com/images/thumb/b/b7/Mastery_point_%28Central_Tyria%29.png/60px-Mastery_point_%28Central_Tyria%29.png",
	Maguuma: "https://wiki.guildwars2.com/images/thumb/8/84/Mastery_point_%28Heart_of_Thorns%29.png/60px-Mastery_point_%28Heart_of_Thorns%29.png",
	Desert: "https://wiki.guildwars2.com/images/thumb/4/41/Mastery_point_%28Path_of_Fire%29.png/60px-Mastery_point_%28Path_of_Fire%29.png",
	Unknown: "https://wiki.guildwars2.com/images/thumb/2/25/Mastery_point_%28Icebrood_Saga%29.png/60px-Mastery_point_%28Icebrood_Saga%29.png"
}

// Table to force icons for the groups, selector looks weird without something there
const groupIconOverride = {
	"Daily": "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
	"Story Journal": "https://wiki.guildwars2.com/images/1/13/Storyline_%28interface%29.png",
	"General": "https://render.guildwars2.com/file/6631174867B0D6BC62EE3B3BFF2669336DDAE4DA/866106.png",
	"Path of Fire": "https://render.guildwars2.com/file/B0A70F5A307EDD53DD462EBF517376057242AC74/1769809.png",
	"Heart of Thorns": "https://render.guildwars2.com/file/FB0BA9033D37C93346949B5EF001720D27CD07C2/1228233.png",
	"Side Stories": "https://render.guildwars2.com/file/C16C0A32AEB2DCC22B1BB2BCFE0F12F772170DB4/1431767.png",
	"Competitive": "https://render.guildwars2.com/file/7F4E2835316DE912B1493CCF500A9D5CF4A83B4A/42676.png",
	"Raids": "https://render.guildwars2.com/file/9F5C23543CB8C715B7022635C10AA6D5011E74B3/1302679.png",
	"Fractals of the Mists": "https://render.guildwars2.com/file/9A6791950A5F3EBD15C91C2942F1E3C8D5221B28/602779.png",
	"Collections": "https://wiki.guildwars2.com/images/5/53/Collection_%28dialogue_icon%29.png",
	"Historical": "https://render.guildwars2.com/file/6631174867B0D6BC62EE3B3BFF2669336DDAE4DA/866106.png",
	
	// Helper func for easier .map()ing
	getGroupIcon: function (group) {
		group.icon = groupIconOverride[group.name]
		return group
	}
}

function getMasteryPointIcon(ach) {
	if (!ach || !ach.rewards)
		return ""

	var region;
	for (var i = 0; i < ach.rewards.length; i++) {
		if (ach.rewards[i].type === "Mastery") {
			region = ach.rewards[i].region
			break
		}
	}

	if (!region)
		return ""

	return (
		<div>
			<img
				src={mastery_points[region]}
				width={24}
				height={24}
				alt={`${region} Mastery Point`}
				/>
		</div>
	)
}

class SelectorTreeItem extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			showChild: false,
			children: []
		}
	}

	toggleChildren(e) {
		this.setState((state) => {
			if (!state.children.length) {
				this.props.fetchChildren().then((ret) => (this.setState({children: ret})))
			}
			return {
				showChild: !state.showChild
			}
		})
	}

	render() {
		return (
			<div className="selector-tree-item">
				<div onClick={this.toggleChildren.bind(this)}>
					{this.props.title}
				</div>
				{
					(this.state.showChild) ?
						this.state.children.map(this.props.renderChild).map(e => (
							<div className="selector-tree-child">
								{e}
							</div>
						))
					 : ""
				}
			</div>
		)
	}
}

class AchievementSelector extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			groups: [],
			categories: {},
		}
	}

	componentDidMount() {
		GW2API.getAchievementGroups().then((groups) => (
			this.setState({groups: groups})
		))

	}

	render() {
		return (
			<div className="AchievementSelector achievement-selector-list">
				{
					this.state.groups.sort(sortByOrderField).map(groupIconOverride.getGroupIcon)
						.map(g => (
						<SelectorTreeItem
							style={{zIndex: 1}}
							key={`group-selector-${g.id}`}
							title={<SelectorListItem data={g}/>}
							data={g}
							fetchChildren={
								async () => 
									(await GW2API.getAchievementCategories(g.categories))
										.sort(sortByOrderField)
							}
							renderChild={(cat) => (
								<SelectorTreeItem
									style={{zIndex: 2}}
									key={`category-selector-${cat.id}`}
									title={<SelectorListItem data={cat}/>}
									data={cat}
									fetchChildren={async () => (
											(await GW2API.getAchievements(cat.achievements))
											.sort(sortByName)
											.sort(sortByMoveToTop)
											.sort(sortByDone(this.props.playerAchieves))
										)
									}
									renderChild={(ach) => (
										<SelectorAchievement 
											selectAchievement={this.props.selectAchievement}
											achievement={ach}
											complete={this.props.playerAchieves[ach.id]?.done} />
										)
									} />
							)} />
					))
				}

			</div>
		)
	}
}

// For displaying the Group and Category header
function SelectorListItem(props) {

	// Helper to render the actually visible part
	function inner() {
		return (
			<div className="achievement-list-item">
				<div className="achievement-list-icon">
				{
					(props.data.icon) ? <img src={props.data.icon} alt={props.data.name}/> : ""
				}
				</div>
				<div>
					{props.data.name}
				</div>
			</div>
		)
	}

	// Only use the overlay trigger if there's actually something to render...
	if (props.data.description) {
		return (
			<OverlayTrigger
			overlay={
				<Popover show={!!props.data.description}>
					<Popover.Content>
						{props.data.description}
					</Popover.Content>
				</Popover>
			}
			placement="right"
			transition={false}>
				{inner()}
			</OverlayTrigger>
		)
	}

	// ...don't bother otherwise
	return inner()
}

// For the little extra work needed in rendering an actual selectable achievement
function SelectorAchievement(props) {
	return (
		<OverlayTrigger
		overlay={<AchievementTooltip achievement={props.achievement}/>}
		key={"achieve-select-" + props.achievement.id}
		placement="right"
		transition={false}>
			<div 
			className={`selector-achievement ${(props.complete) ? "selector-achievement-complete" : ""}`}
			onClick={(e) => {props.selectAchievement.current.selectAchievement(props.achievement.id)}}>
				<div className="achievement-list-item">
					<div className="achievement-list-icon">
					{
						(props.achievement.icon) ? <img src={props.achievement.icon} alt={props.achievement.name}/> : ""
					}
					</div>
					<div>
						{props.achievement.name}
						{(props.achievement.flags.indexOf("Repeatable") >= 0) ?
							<img
								src="https://wiki.guildwars2.com/images/0/01/Black_Lion_Trading_Company_currency_exchange_icon.png"
								alt="Repeatable Achievement"/>
							: ""}
					</div>
				</div>
				{getMasteryPointIcon(props.achievement)}
			</div>
		</OverlayTrigger>
	)
}

/******* Accessory Sorting functions *******/

// Sort func for categories/groups based on their order value
function sortByOrderField(itemA, itemB) {
	return itemA.order - itemB.order
}

function sortByMoveToTop(achA, achB) {
	var a = !!(achA.flags.indexOf("MoveToTop") + 1)
	var b = !!(achB.flags.indexOf("MoveToTop") + 1)

	switch (true) {
		case  a &&  b: return  0;  // Both have the flag set
		case  a && !b: return -1;  // Only A does
		case !a &&  b: return  1;  // Only B does
		case !a && !b: return  0;  // Neither does

		// Default case to silence a warning, even though the above is exhaustive
		default: console.log(`somehow this broke ${a} ${b}`); return 0;
	}
}

function sortByName(a,b) {
	return a.name.localeCompare(b.name)
}

function sortByDone(playerAchieves) {
	return (a,b) => {
		var pa = playerAchieves[a.id]
		var pb = playerAchieves[b.id]

		// If both are unset, probably don't have API data yet
		if ((!pa) && (!pb)) {
			return 0
		}
		
		// In case one is not set in the achieves for some reason
		if (!pa) {
			if (pb.done) return -1;
			return 0
		}
		if (!pb){
			if (pa.done) return 1;
			return 0
		}

		// They are the same, doesn't matter
		if (pa.done === pb.done) return 0;

		// They are different, convert false/true to -1 or 1
		var ret = (pa.done) ? 1 : -1
		return ret
	}
}

export default AchievementSelector