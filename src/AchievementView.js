import React from 'react'
import TieredAchieveProgress from './TieredAchieveProgress'
import AchieveProgress from './AchieveProgress'
import AchievementTooltip from './AchievementTooltip'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import OverlayTrigger from 'react-bootstrap/OverlayTrigger'

// TODO: Remove this
import tiered_rewards from './tiered_rewards.json'
import item_data from './item_data.json'

import "./AchievementView.css"


// TODO: probably convert to CSS, have it be a general style override
const gradient_map = {
	//"5327": "linear-gradient(to right, rgb(53, 50, 61), rgb(152, 114, 114))",
	"5327": "linear-gradient(to right, rgb(255, 255, 255), rgb(57, 57, 57))",
	"5312": "linear-gradient(to right, rgb(48, 0, 0), rgb(212, 0, 0))",
	"5319": "linear-gradient(to right, rgb(214, 0, 0), rgb(255, 191, 0))",
	"5298": "linear-gradient(to right, #084099, #6e6d74)"
  }

function getRewardList(achid) {
	var tiers = tiered_rewards[achid]

	// TODO: Adjust the format for the tiered rewards to match the API's rewards table
	if (tiers) {
		return tiers.map(i => item_data[i])
	}

	return undefined
}



// TODO: define a compact view
function Achievement(props) {
	const ach = props.data
	const current = props.current

	var tierRewards = getRewardList(ach.id)
	var curr = (current ? current.current : 0)

	if (tierRewards) {
		return (
			<TieredAchieveProgress
				name={ach.name}
				max={ach.tiers.slice(-1)[0].count}
				filledBackground={gradient_map[ach.id]}
				current={curr}
				steps={ach.tiers.map(t => t.count)}
				tierRewards={tierRewards}
				completionRewards={ach.rewards}
			/>
		)
	}

	return (
		<AchieveProgress
			current={curr}
			max={ach.tiers.slice(-1)[0].count}
			/>
	)
}

// TODO: Split expanded and compact view components at some point
// TODO: Split out the inline CSS to a separate CSS file
class AchievementView extends React.Component {
	render() {
		return (
			<div>
				{
				this.props.achievements
					.map(ach => (
				<Row key={"ap-"+ach.id} style={{padding:"3px"}} className={(this.props.current[ach.id]?.done) ? "alert-success" : ""}>
					<Col sm="auto">
						<OverlayTrigger
							placement="right"
							delay={{ show: 150, hide: 250 }}
							overlay={
								<AchievementTooltip achievement={ach}/>
							}
						>
							<div className="achievement-name">
								{(ach.flags.indexOf("Repeatable") >= 0) ? 
									<img
										src="https://wiki.guildwars2.com/images/0/01/Black_Lion_Trading_Company_currency_exchange_icon.png"
										width={24} height={24}
										alt="Repeatable Achievement"/>
								: <div style={{width: 24}}/>}
								{ach.name}
							</div>
						</OverlayTrigger>
					</Col>
					<Col sm="auto">
						<div className="achievement-progress">
						{"" + ((this.props.current[ach.id]) ? this.props.current[ach.id].current : "0") + " / " + ach.tiers.slice(-1)[0].count}
						</div>
					</Col>
					<Col style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center"
					}}>
					{/* TODO: Switch between large/compact form based on state */}
					{/* TODO: make this better, probably prone to breaking */}
						<Achievement
							key={"ap-col-"+ach.id}
							data={ach}
							current={this.props.current[ach.id]} />
					</Col>
					<Col sm="auto">
						<Button className="AchievementClose" style={{padding: ".75rem .75rem"}}
							onClick={() => this.props.deselectAchievement(ach.id)}>
							<span>×</span>
						</Button>
					</Col>
				</Row>
				))
				}
			</div>
		)
	}
}

export default AchievementView