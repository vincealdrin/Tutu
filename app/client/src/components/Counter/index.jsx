import React from 'react';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import {
  increment,
  incrementAsync,
  decrement,
  decrementAsync,
} from '../../modules/counter';

const Counter = (props) => (
  <div>
    <h1>Counter</h1>
    <p>Count: {props.count}</p>

    <p>
      <Button onClick={props.increment} disabled={props.isIncrementing}>Increment</Button>
      <Button onClick={props.incrementAsync} disabled={props.isIncrementing}>Increment Async</Button>
    </p>

    <p>
      <Button onClick={props.decrement} disabled={props.isDecrementing}>Decrement</Button>
      <Button onClick={props.decrementAsync} disabled={props.isDecrementing}>Decrement Async</Button>
    </p>

  </div>
);

const mapStateToProps = (state) => ({
  count: state.counter.count,
  isIncrementing: state.counter.isIncrementing,
  isDecrementing: state.counter.isDecrementing,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  increment,
  incrementAsync,
  decrement,
  decrementAsync,
  changePage: () => push('/about-us'),
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Counter);
