import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Menu } from 'semantic-ui-react';
import { fetchUsers, addUser, deleteUsers } from '../../modules/users';
import DataTable from '../Common/DataTable';
import UserForm from './UserForm';
import UsersFeed from './UsersFeed';

const columns = [
  { key: 'username', text: 'Username' },
  { key: 'name', text: 'Name' },
  { key: 'role', text: 'Role', wrapper: (role) => (role === 'curator' ? 'journalist' : role) },
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
  state = { activeItem: 'users activity' };
  componentDidMount() {
    this.props.fetchUsers();
  }

  changeItem = (_, { name }) => this.setState({ activeItem: name });

  renderActiveMenuItem = () => {
    const {
      users,
      totalCount,
    } = this.props;

    switch (this.state.activeItem) {
      case 'users activity': {
        return <UsersFeed />;
      }
      case 'users table': {
        return (
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
            showActionsColumn={false}
            // rowActions={(id) => (
            //   <div>
            //     <Button content="Update" />
            //   </div>
            // )}
          />
        );
      }
      default:
        return <p>No Item</p>;
    }
  }

  render() {
    const { activeItem } = this.state;

    return (
      <div className="users-container">
        <Menu pointing secondary>
          <Menu.Item name="users activity" active={activeItem === 'users activity'} onClick={this.changeItem} />
          <Menu.Item name="users table" active={activeItem === 'users table'} onClick={this.changeItem} />
        </Menu>
        {this.renderActiveMenuItem()}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Users);
