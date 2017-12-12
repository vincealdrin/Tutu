import React, { PureComponent } from 'react';
import {
  Icon,
  Button,
  Menu,
  Table,
  Checkbox,
  Input,
  Dropdown,
  Modal,
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
class DataTable extends PureComponent {
  state = {
    isDeleting: false,
    isAdding: false,
    isEditing: false,
    deletionList: [],
    searchText: '',
    searchFilter: '',
    page: 0,
    perPage: 20,
  }

  setSearchFilter = (searchFilter) => this.setState({ searchFilter })
  setSearchText = (searchText) => this.setState({ searchText })
  selectPerPage = (perPage) => this.setState({ perPage })
  enableAdd = () => this.setState({ isAdding: true })
  cancelAdd = () => this.setState({ isAdding: false })
  enableDelete = () => this.setState({ isDeleting: true })
  cancelDelete = () => this.setState({ isDeleting: false })

  clearDeletionList = () => this.setState({ deletionList: [] })
  appendDeletion = (selectedId) => {
    this.setState({ deletionList: [...this.state.deletionList, selectedId] });
  }
  removeDeletion = (selectedId) => {
    this.setState({ deletionList: this.state.deletionList.filter((id) => id !== selectedId) });
  }

  render() {
    const {
      defaultSearchFilter,
      columns = [],
      data = [],
      totalCount,
      label,
      addModalContent,
      addModalActions,
      onDeleteSelected,
    } = this.props;
    const {
      isEditing, isAdding, isDeleting, deletionList,
    } = this.state;

    const totalPages = Math.ceil((totalCount || this.state.perPage) / this.state.perPage);
    return (
      <Table celled>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="5">
              <Button
                labelPosition="left"
                size="small"
                icon={isDeleting ? 'cancel' : 'trash'}
                content={isDeleting ? 'Cancel ' : `Delete ${label}`}
                onClick={() => {
                  if (isDeleting) {
                      this.cancelDelete();
                      this.clearDeletionList();
                  } else {
                    this.enableDelete();
                  }
                }}
                disabled={isAdding}
                secondary
              />
              {!isDeleting
                ? (
                  <Modal
                    trigger={
                      <Button
                        labelPosition="left"
                        size="small"
                        onClick={this.enableAdd}
                        icon="add"
                        content={`Add ${label}`}
                        primary
                      />
                    }
                    open={isAdding}
                  >
                    <Modal.Header>Add {label}</Modal.Header>
                    <Modal.Content scrolling>
                      <Modal.Description>
                        {addModalContent}
                      </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                      {addModalActions(this.cancelAdd)}
                    </Modal.Actions>
                  </Modal>
                )
                : (
                  <Button
                    labelPosition="left"
                    size="small"
                    icon="trash"
                    content="Delete Selected"
                    color="red"
                    onClick={async () => {
                      await onDeleteSelected(deletionList, this.cancelDelete);
                      this.cancelDelete();
                      this.clearDeletionList();
                    }}
                  />
                )}
              <div style={searchContainerStyle}>
                <Input
                  icon="search"
                  placeholder="Search..."
                  onChange={(__, { value }) => this.setSearchText(value)}
                  label={(
                    <Dropdown
                      defaultValue={defaultSearchFilter}
                      options={columns.map((column) => ({ text: column.text, value: column.key }))}
                      onChange={(__, { value }) => this.setSearchFilter(value)}
                    />
                  )}
                />
              </div>
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            {this.state.isDeleting ? <Table.HeaderCell /> : null}
            {columns.map(({ text }) => (
              <Table.HeaderCell key={shortid.generate()}>
                {text}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.map((datum) => {
            const isChecked = deletionList.includes(datum.id);
            return (
              <Table.Row key={shortid.generate()}>
                {this.state.isDeleting ? (
                  <Table.Cell collapsing>
                    <Checkbox
                      onClick={() => (isChecked
                        ? this.removeDeletion(datum.id)
                        : this.appendDeletion(datum.id))}
                      checked={isChecked}
                      slider
                    />
                  </Table.Cell>
                ) : null}
                {columns.map(({ key, dkey, wrappers = {} }) => {
                  const val = dkey ? dkey(datum) : datum[key];
                  return (
                    <Table.Cell key={shortid.generate()}>
                      {wrappers[key] ? wrappers[key](val) : val}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="5">
              <Button.Group>
                <Button disabled>Rows</Button>
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
