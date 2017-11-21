import React, { Component } from 'react';
import {
  Icon,
  Button,
  Menu,
  Table,
  Checkbox,
  Input,
  Dropdown,
} from 'semantic-ui-react';
import shortid from 'shortid';

const searchContainerStyle = { float: 'right' };
const rowsPerPageOptions = [
  { key: '5', text: '5', value: 5 },
  { key: '10', text: '10', value: 10 },
  { key: '20', text: '20', value: 20 },
  { key: '30', text: '30', value: 30 },
  { key: '50', text: '50', value: 50 },
];
class DataTable extends Component {
  state = {
    isDeleting: false,
    isAdding: false,
    isEditing: false,
    searchText: '',
    searchFilter: '',
    page: 0,
    perPage: 20,
  }

  setsearchFilter = (searchFilter) => this.setState({ searchFilter })
  setsearchText = (searchText) => this.setState({ searchText })
  selectPerPage = (perPage) => this.setState({ perPage })
  toggleDelete = () => this.setState({ isDeleting: !this.state.isDeleting })

  render() {
    const {
      defaultSearchFilter,
      columns = [],
      data = [],
      totalCount,
    } = this.props;

    const totalPages = Math.ceil((totalCount || this.state.perPage) / this.state.perPage);
    return (
      <Table celled>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="5">
              <Button
                labelPosition="left"
                size="small"
                onClick={this.toggleDelete}
                icon
                secondary
              >
                <Icon name="remove user" /> Remove Users
              </Button>
              <Button
                labelPosition="left"
                size="small"
                disabled={this.state.isDeleting}
                icon
                primary
              >
                <Icon name="add user" /> Add User
              </Button>
              <div style={searchContainerStyle}>
                <Input
                  icon="search"
                  placeholder="Search..."
                  onChange={(__, { value }) => this.setSearchText(value)}
                  label={(
                    <Dropdown
                      defaultValue={defaultSearchFilter}
                      options={columns.map((column) => ({ ...column, value: column.key }))}
                      onChange={(__, { value }) => this.setsearchFilter(value)}
                    />
                  )}
                />
              </div>
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            {this.state.isDeleting ? <Table.HeaderCell /> : null}
            {columns.map(({ text }) => <Table.HeaderCell key={shortid.generate()}>{text}</Table.HeaderCell>)}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.map((datum) => (
            <Table.Row key={shortid.generate()}>
              {this.state.isDeleting ? (
                <Table.Cell collapsing>
                  <Checkbox slider />
                </Table.Cell>
              ) : null}
              {columns.map(({ key }) => <Table.Cell key={shortid.generate()}>{datum[key]}</Table.Cell>)}
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="5">
              <Button.Group>
                <Button disabled>Rows per page</Button>
                <Dropdown
                  options={rowsPerPageOptions}
                  onChange={(__, { value }) => this.selectPerPage(value)}
                  value={this.state.perPage}
                  floating
                  button
                />
              </Button.Group>
              <Menu floated="right" pagination>
                <Menu.Item as="a" icon>
                  <Icon name="left chevron" />
                </Menu.Item>
                <Menu.Item as="a">1</Menu.Item>
                <Menu.Item as="a" disabled>...</Menu.Item>
                <Menu.Item as="a">3</Menu.Item>
                <Menu.Item as="a">4</Menu.Item>
                <Menu.Item as="a" icon>
                  <Icon name="right chevron" />
                </Menu.Item>
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default DataTable;
