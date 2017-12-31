import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Modal } from 'semantic-ui-react';

const mapStateToProps = ({

}) => ({
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

class Insights extends Component {
  state = { isOpen: false }

  openModal = () => this.setState({ isOpen: true });
  closeModal = () => this.setState({ isOpen: false });

  render() {
    const { isOpen } = this.state;

    return (
      <div>
        <Button
          content="Insights"
          icon="bar chart"
          labelPosition="left"
          onClick={this.openModal}
        />
        <Modal
          open={isOpen}
          onClose={this.closeModal}
          closeOnDimmerClick
        >
          <Modal.Header>Insights</Modal.Header>
          <Modal.Content image>
            <Modal.Description>
              <p>We've found the following gravatar image associated with your e-mail address.</p>
              <p>Is it okay to use this photo?</p>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={this.closeModal}
              content="Close"
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);
