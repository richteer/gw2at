import React from 'react'

import ItemWithTooltip from './ItemWithTooltip'
import AchievementBit from './AchievementBit'

class AchievementDetail extends React.Component {

  isBitDone(bitIndex){
    return this.props.current?.bits?.includes(bitIndex) || this.props.current?.done
  }

  render() {
    if(this.props.achievement.bits)
    {
      return (
        <div className="ach-det">
          <div className="ach-det-req">
            {this.props.achievement.requirement}
          </div>
          <div className="ach-det-desc">
            <i dangerouslySetInnerHTML={{__html: this.props.achievement.description}}></i>
          </div>
          <div className="ach-det-lockedtext">
            <i style={{color:"#F00"}}>{this.props.achievement.locked_text}</i>
          </div>
          <div className="ach-det-bits">
          {
            this.props.achievement.bits
              .map((bit, index) => (
                <div>
                  <AchievementBit 
                      bit={bit}/>
                </div>
              ))
          }
          </div>
        </div>
      )
    }

    return (
      <div className="ach-det">
        <div className="ach-det-req">
          {this.props.achievement.requirement}
        </div>
        <div className="ach-det-desc">
          <i dangerouslySetInnerHTML={{__html: this.props.achievement.description}}></i>
        </div>
      </div>
    )
  }
}

export default AchievementDetail