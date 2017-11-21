import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUsers } from '../../modules/users';
import DataTable from '../Common/DataTable';

const mapStateToProps = ({
  users: {
    users,
    fetchStatus,
    createStatus,
    updateStatus,
    deleteStatus,
    totalCount,
  },
}) => ({
  users,
  fetchStatus,
  createStatus,
  updateStatus,
  deleteStatus,
  totalCount,
});

const columns = [
  { key: 'username', text: 'Username' },
  { key: 'name', text: 'Name' },
];


const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchUsers,
}, dispatch);

class Users extends Component {
  componentDidMount() {
    this.props.fetchUsers();
  }

  render() {
    const {
      users,
      totalCount,
    } = this.props;

    return (
      <div className="users-container">
        <DataTable
          defaultSearchFilter="name"
          columns={columns}
          data={users}
          totalCount={totalCount}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Users);
