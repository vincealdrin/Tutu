import React, { Component } from 'react';
import {
  Button,
  Table,
  Checkbox,
  Input,
  Dropdown,
  Modal,
  Header,
} from 'semantic-ui-react';
import shortid from 'shortid';
import debounce from 'lodash/debounce';
import Pagination from './Pagination';

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
    deletionList: [],
    search: '',
    searchFilter: this.props.defaultSearchFilter,
    currentPage: 1,
    limit: 20,
  }

  componentDidMount() {
    const { initLoad, onPaginate } = this.props;

    if (initLoad) {
      onPaginate();
    }
  }

  enableAdd = () => this.setState({ isAdding: true })
  cancelAdd = () => this.setState({ isAdding: false })
  enableDelete = () => this.setState({ isDeleting: true })
  cancelDelete = () => this.setState({ isDeleting: false })

  clearDeletionList = () => this.setState({ deletionList: [] })
  appendAllDeletion = (ids) => {
    this.setState({ deletionList: ids });
  }
  appendDeletion = (selectedId) => {
    this.setState({ deletionList: [...this.state.deletionList, selectedId] });
  }
  removeDeletion = (selectedId) => {
    this.setState({ deletionList: this.state.deletionList.filter((id) => id !== selectedId) });
  }

  debouncedOnPaginate = debounce(this.props.onPaginate, 300)

  render() {
    const {
      defaultSearchFilter,
      columns = [],
      data = [],
      hideAddBtn = false,
      hideDeleteBtn = false,
      totalCount,
      label,
      deleteLabel,
      addModalContent,
      addModalActions,
      onDeleteSelected,
      onPaginate,
      rowActions,
      hideActions = false,
    } = this.props;
    const {
      isEditing,
      isAdding,
      isDeleting,
      deletionList,
      currentPage,
      limit,
      searchFilter,
      search,
    } = this.state;
    const totalPages = Math.ceil((totalCount || limit) / limit);

    return (
      <Table celled>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="100">
              {!hideDeleteBtn ? (
                <Button
                  labelPosition="left"
                  size="small"
                  icon={isDeleting ? 'cancel' : 'trash'}
                  content={isDeleting ? 'Cancel ' : `Delete ${deleteLabel || label}`}
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
            ) : null}
              {!isDeleting && !hideAddBtn ? (
                <Modal
                  size="small"
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
                  <Modal.Actions className="sources-modal-note">
                    {addModalActions && addModalActions(this.cancelAdd)}
                  </Modal.Actions>
                </Modal>
                ) : null}
              {isDeleting && !hideDeleteBtn ? (
                <Button
                  labelPosition="left"
                  size="small"
                  icon="trash"
                  content="Delete Selected"
                  color="red"
                  onClick={async () => {
                    await onDeleteSelected(deletionList);
                    this.cancelDelete();

                    if (totalCount - deletionList.length > 0 && totalPages !== 1) {
                      this.setState({ currentPage: 1 }, () => {
                        this.debouncedOnPaginate(0, limit, searchFilter, search);
                      });
                    }

                    this.clearDeletionList();
                  }}
                />
                ) : null}
              <div style={searchContainerStyle}>
                <Input
                  icon="search"
                  placeholder="Search..."
                  onChange={(__, { value }) => {
                    this.setState({ search: value, currentPage: 1 }, () => {
                      this.debouncedOnPaginate(0, limit, searchFilter, value);
                    });
                  }}
                  label={(
                    <Dropdown
                      defaultValue={defaultSearchFilter}
                      options={columns.map((column) => ({ text: column.text, value: column.key }))}
                      onChange={(__, { value }) => this.setState({ searchFilter: value })}
                    />
                  )}
                />
              </div>
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            {this.state.isDeleting ? (
              <Table.HeaderCell>
                {data.length ? (
                  <Checkbox
                    onClick={() => {
                    if (deletionList.length === data.length) {
                      this.clearDeletionList();
                    } else {
                      this.appendAllDeletion(data.map((d) => d.id));
                    }
                  }}
                    checked={deletionList.length === data.length && deletionList.length}
                  />
                ) : '[Empty]'}
              </Table.HeaderCell>
            ) : null}
            {columns.map(({ text }) => (
              <Table.HeaderCell key={shortid.generate()}>
                {text}
              </Table.HeaderCell>
            ))}
            {!hideActions ? (
              <Table.HeaderCell>Actions</Table.HeaderCell>
            ) : null}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.slice(0, limit).map((datum) => {
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
                    />
                  </Table.Cell>
                ) : null}
                {columns.map(({ key, wrapper, accessor }) => (
                  <Table.Cell key={shortid.generate()}>
                    {wrapper
                      ? wrapper(datum[accessor || key])
                      : datum[accessor || key]}
                  </Table.Cell>
                ))}
                {!hideActions ? (
                  <Table.Cell>
                    {rowActions && rowActions(datum)}
                  </Table.Cell>
                ) : null}
              </Table.Row>
            );
          })}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="100">
              <Button.Group>
                <Button disabled>Rows</Button>
                <Dropdown
                  options={rowsPerPageOptions}
                  onChange={(__, { value }) => {
                    this.setState({
                      limit: value,
                      currentPage: 1,
                    }, () => {
                      onPaginate(0, value, searchFilter, search);
                    });
                  }}
                  value={this.state.limit}
                  floating
                  button
                />
              </Button.Group>
              {limit < totalCount ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChange={(page) => {
                    this.setState({ currentPage: page }, () => {
                      this.debouncedOnPaginate(page - 1, limit, searchFilter, search);
                    });
                  }}
                />
              ) : null}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default DataTable;
