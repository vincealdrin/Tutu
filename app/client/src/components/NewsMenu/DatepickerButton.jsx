import React, { Component } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import './style.css';

class DatepickerButton extends Component {
	render() {
		return (
			<Button
				size="large"
				className="datepicker-button"
				onClick={this.props.onClick}
			>
			<Icon name="calendar" />
			{this.props.value}
			</Button>
		)
	}
}

export default DatepickerButton;