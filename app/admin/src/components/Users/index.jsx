import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { fetchUsers, addUser, deleteUsers } from '../../modules/users';
import DataTable from '../Common/DataTable';
import UserForm from './UserForm';
import UsersFeed from './UsersFeed';

const columns = [
  { key: 'username', text: 'Username' },
  { key: 'name', text: 'Name' },
  { key: 'role', text: 'Role' },
];

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

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchUsers,
  addUser,
  deleteUsers,
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
          defaultSearchFilter="username"
          columns={columns}
          data={users}
          totalCount={totalCount}
          label="User"
          onDeleteSelected={this.props.deleteUsers}
          onPaginate={this.props.fetchUsers}
          addModalContent={<UserForm />}
          addModalActions={(closeModal) => (
            <div>
              <Button
                color="black"
                content="Cancel"
                onClick={closeModal}
              />
              <Button
                color="green"
                onClick={async () => {
                  await this.props.addUser();
                  closeModal();
                }}
                content="Add User"
              />
            </div>
          )}
          rowActions={(id) => (
            <div>
              {id}
            </div>
          )}
        />
        <UsersFeed />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Users);
