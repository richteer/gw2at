import React from 'react'
import { ProgressBar } from 'react-step-progress-bar'

import "react-step-progress-bar/styles.css";

var toPercent = function(now, max) {
    return (now / max) * 100
  }

class AchieveProgress extends React.Component {
    render() {
        return (
        <ProgressBar
            height={24}
            //filledBackground="linear-gradient(to right, #094a79, #00d4ff)"
            filledBackground={(this.props.filledBackground) ?
                this.props.filledBackground : "linear-gradient(to right, #094a79, #00d4ff)"}
            percent={toPercent(this.props.current, this.props.max)}
            >
        </ProgressBar>
        )
    }
  
}

export default AchieveProgress