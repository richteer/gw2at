import React from 'react'
import { ProgressBar, Step } from 'react-step-progress-bar'

import ItemWithTooltip from './ItemWithTooltip'

import "react-step-progress-bar/styles.css";

var toPercent = function(now, max) {
  return (now / max) * 100
}

// TODO: Eventually unify with the non tiered variant
class TieredAchieveProgress extends React.Component {
  render() {
    return (
    <div>
      <ProgressBar
        key={"pb-"+this.props.name}
        height={24}
        //filledBackground="linear-gradient(to right, #094a79, #00d4ff)"
        filledBackground={(this.props.filledBackground) ?
          this.props.filledBackground : "linear-gradient(to right, #094a79, #00d4ff)"}
        percent={toPercent(this.props.current, this.props.max)}
        stepPositions={this.props.steps.map(s => toPercent(s, this.props.max))}
        >
        {
          this.props.steps.map((s,i) => (
            <Step
            key={"pb-step-"+s}
            position={toPercent(this.props.step, this.props.max)}>
              {(s) => (
                (!s.accomplished) ? 
                  <ItemWithTooltip
                    item={(this.props.tierRewards[i]) }
                    size={24}/>
                  : 
                  <ItemWithTooltip
                  item={this.props.tierRewards[i]}
                  size={18}
                  grey/>
                )}
            </Step>
          ))
        }
      </ProgressBar>
    </div>
    )
  }

}

export default TieredAchieveProgress