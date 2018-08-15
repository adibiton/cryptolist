import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { ResolutionGroup } from './resolution-group';
import DateTime from 'react-datetime';
import moment from 'moment';

export class ChartUtils extends React.Component {
  static propTypes = {
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    resolution: PropTypes.object,
    updateResolution: PropTypes.func,
    updateStartTime: PropTypes.func,
    updateEndTime: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.isValidStart = this.isValidStart.bind(this);
    this.isValidEnd = this.isValidEnd.bind(this);
    this.startTimeRef = React.createRef();
    this.endTimeRef = React.createRef();
    this.hideDateTimes = this.hideDateTimes.bind(this);
    this.toggleStartTime = this.toggleStartTime.bind(this);
    this.toggleEndTime = this.toggleEndTime.bind(this);
    this.state = {
      startShown: false,
      endShown: false,
    };
  }

  isValidStart(current) {
    return current.unix() * 1000 < this.props.endTime && current.unix() <= moment().unix();
  }

  isValidEnd(current) {
    return current.unix() * 1000 > this.props.startTime && current.unix() <= moment().unix();
  }

  toggleStartTime(e) {
    e.preventDefault();
    this.setState({ startShown: !this.state.startShown });
  }

  toggleEndTime(e) {
    e.preventDefault();
    this.setState({ endShown: !this.state.endShown });
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.hideDateTimes, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.hideDateTimes, false);
  }

  hideDateTimes(e) {
    if (this.startTimeRef.contains(e.target) || this.endTimeRef.contains(e.target)) {
      return;
    }
    this.setState({
      startShown: false,
      endShown: false,
    });
  }

  render() {
    return (
      <div className="controls row">
        <div className="col-sm-2">
          <ResolutionGroup
            updateResolution={this.props.updateResolution}
            resolution={this.props.resolution}
          />
        </div>
        <div className="startTime offset-sm-1 col-sm-4" ref={ref => (this.startTimeRef = ref)}>
          <Button onClick={this.toggleStartTime}>
            {moment(this.props.startTime).format('D/M/YY H:m')}
          </Button>
          {this.state.startShown && (
            <DateTime
              value={this.props.startTime}
              onChange={this.props.updateStartTime}
              isValidDate={this.isValidStart}
              input={false}
            />
          )}
        </div>
        {' - '}
        <div className="endTime offset-sm-3 col-sm-4" ref={ref => (this.endTimeRef = ref)}>
          <Button onClick={this.toggleEndTime}>
            {moment(this.props.endTime).format('D/M/YY H:m')}
          </Button>
          {this.state.endShown && (
            <DateTime
              value={this.props.endTime}
              onChange={this.props.updateEndTime}
              isValidDate={this.isValidEnd}
              input={false}
            />
          )}
        </div>
      </div>
    );
  }
}