import React from 'react'

import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'

import AchievementTooltip from './AchievementTooltip'
import './AchievementSelector.css'

import all_groups from './achievement_groups.json'
import all_categories from './achievement_categories.json'
import all_achievements from './achievement_data.json'

const mastery_points = {
	Tyria: "https://wiki.guildwars2.com/images/thumb/b/b7/Mastery_point_%28Central_Tyria%29.png/60px-Mastery_point_%28Central_Tyria%29.png",
	Maguuma: "https://wiki.guildwars2.com/images/thumb/8/84/Mastery_point_%28Heart_of_Thorns%29.png/60px-Mastery_point_%28Heart_of_Thorns%29.png",
	Desert: "https://wiki.guildwars2.com/images/thumb/4/41/Mastery_point_%28Path_of_Fire%29.png/60px-Mastery_point_%28Path_of_Fire%29.png",
	Unknown: "https://wiki.guildwars2.com/images/thumb/2/25/Mastery_point_%28Icebrood_Saga%29.png/60px-Mastery_point_%28Icebrood_Saga%29.png"
}


class OldAchievementSelector extends React.Component {
	render() {
		return (
			<Accordion>
				{ // Outer Accordion for groups
					all_groups.sort((a,b) => a.order > b.order).map(group => (
						<Card key={"group-select-" + group.id}>
							<Accordion.Toggle as={Card.Header} eventKey={group.name}>
								{group.name}
							</Accordion.Toggle>
							<Accordion.Collapse eventKey={group.name}>
      					<Card.Body>
									{ // Inner Accordion for categories
										<Accordion>
											{
												group.categories
													.map(c => (all_categories[c]))
													.sort((a,b) => (a.order > b.order))
													.map(category => (
													<Card key={"category-select-" + category.id}>
														<Accordion.Toggle as={Card.Header} eventKey={category.name}>
															{category.name}
														</Accordion.Toggle>
														<Accordion.Collapse eventKey={category.name}>
															<Card.Body>
																<ListGroup variant="flush">
																{ // Last Inner Accordion for quests. Holy crap the nesting...
																	category.achievements
																		.map(a => (all_achievements[a]))
																		.filter(a => a)
																		.map((ach) => (
																			<ListGroup.Item
																				key={"achieve-select-" + ach.id}
																				onClick={() => this.props.selectAchievement(ach.id)}>
																				{ach.name}
																			</ListGroup.Item>
																		))
																}
																</ListGroup>
															</Card.Body>
														</Accordion.Collapse>
													</Card>
												))
											}
										</Accordion>
									}
								</Card.Body>
    					</Accordion.Collapse>
						</Card>
					))
				}
			</Accordion>
		)
	}
}


class AchievementSelector extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	setGroup(groupid) {
		for (var i = 0; i < all_groups.length; i++) {
			if (all_groups[i].id === groupid) {
				this.setState({group: all_groups[i], category: undefined})
				break
			}
		}
	}

	getMasteryPointIcon(achid) {
		const ach = all_achievements[achid];

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

	render() {
		return (
			<div className="AchievementSelector">
				<div style={{flexShrink: 0}}>
					<Dropdown alignRight>
						<Dropdown.Toggle block size="sm">
							{(this.state.group) ? this.state.group.name : "Select Group"}
						</Dropdown.Toggle>
						<Dropdown.Menu>
						{
							all_groups.sort((a,b) => a.order > b.order).map(group => (
								<Dropdown.Item
									key={`group-dd-${group.id}`}
									active={this.state.group?.id === group.id}
									eventKey={group.id}
									onSelect={this.setGroup.bind(this)}
								>{group.name}</Dropdown.Item>
							))
						}
						</Dropdown.Menu>
					</Dropdown>
					<Dropdown alignRight>
						<Dropdown.Toggle
							block
							size="sm"
							disabled={!this.state.group}>
							{(this.state.category) ? this.state.category.name : "Select Category"}
						</Dropdown.Toggle>
						<Dropdown.Menu>
						{
							this.state.group?.categories
								.map(c => (all_categories[c]))
								.sort((a,b) => (a.order > b.order))
								.map(category => (
								<Dropdown.Item
									key={`category-dd-${category.id}`}
									eventKey={category.id}
									active={this.state.category?.id === category.id}
									onSelect={(e) => (this.setState({category: all_categories[e]}))}
									>
									<img src={category.icon} width={24} height={24} alt={category.name}/>
									{category.name}
								</Dropdown.Item>
							))
						}
						</Dropdown.Menu>
					</Dropdown>
				</div>
				<ListGroup className="achievement-selector-list" hidden={!this.state.category}>
					{
						this.state.category?.achievements
							.map(a => (all_achievements[a]))
							.filter(a => a)
							.sort(sortByName(this.props.playerAchieves))
							.sort(sortByDone(this.props.playerAchieves))
							.map((ach) => (
								<OverlayTrigger
										overlay={<AchievementTooltip achievement={ach}/>}
										key={"achieve-select-" + ach.id}
										placement="right"
										transition={false}
										>
									<ListGroup.Item
										action
										className="achievement-list-item"
										variant={(!this.props.playerAchieves[ach.id]) ? "light"
											: ((this.props.playerAchieves[ach.id].done) ? "success" : "")}
										onClick={() => {console.log(this.props.selectAchievement); this.props.selectAchievement.current.selectAchievement(ach.id)}}>
										<div>{ach.name}
										{(ach.flags.indexOf("Repeatable") >= 0) ?
											<img
												src="https://wiki.guildwars2.com/images/0/01/Black_Lion_Trading_Company_currency_exchange_icon.png"
												width={24} height={24}
												alt="Repeatable Achievement"/>
										: ""}
										</div>
										{
											(this.props.playerAchieves[ach.id]?.done) ? "" :
												this.getMasteryPointIcon(ach.id)
										}
									</ListGroup.Item>
								</OverlayTrigger>
							))
					}
				</ListGroup>
			</div>
		)
	}
}

function sortByName(playerAchieves) {
	return (a,b) => {
		return a.name.localeCompare(b.name)
	}
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
export { OldAchievementSelector }