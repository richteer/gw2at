import React from 'react'
import Popover from 'react-bootstrap/Popover'

class AchievementTooltip extends React.Component {
  generateBody(ach) {
    // TODO: Use CSS classes for these probably
    return (
      <div>
        {ach.requirement}
        <br/><br/>
        <i dangerouslySetInnerHTML={{__html: ach.description}}></i>
      </div>
    )
  }

  render() {
    return (
      <Popover {...this.props} id={"pop-"+this.props.achievement.id}>
        <Popover.Title>{this.props.achievement.name}</Popover.Title>
        <Popover.Content>{this.generateBody(this.props.achievement)}</Popover.Content>
      </Popover>
    )
  }
}

export default AchievementTooltip