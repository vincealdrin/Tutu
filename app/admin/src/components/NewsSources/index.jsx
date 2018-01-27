import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Segment, Grid, Label, Button, Menu } from 'semantic-ui-react';
import moment from 'moment';
import DataTable from '../Common/DataTable';
import SourcesForm from './SourcesForm';
import PendingSourcesForm from './PendingSourcesForm';
import FakeSourcesForm from './FakeSourcesForm';
import {
  fetchSources,
  addSources,
  deleteSources,
} from '../../modules/sources';
import {
  fetchPendingSources,
  addPendingSources,
  deletePendingSources,
  verifyPendingSource,
} from '../../modules/pendingSources';
import {
  fetchFakeSources,
  addFakeSources,
  deleteFakeSources,
} from '../../modules/fakeSources';
import './styles.css';
import { TIME_FORMAT } from '../../constants';

const columns = [
  { key: 'brand', text: 'Brand' },
  {
    key: 'url',
    wrapper: (val) => (
      <a href={val} target="__blank">{val}</a>
    ),
    text: 'URL',
  },
  { key: 'verifiedBy', text: 'Verified by' },
];
const pendingColumns = [
  {
    key: 'url',
    wrapper: (val) => (
      <a href={val} target="__blank">{val}</a>
    ),
    text: 'URL',
  },
  {
    key: 'brand',
    text: 'Brand',
  },
  {
    key: 'isReliablePred',
    wrapper: (val) => (val ? 'Reliable' : 'Unreliable'),
    text: 'Prediction',
  },
  {
    key: 'timestamp',
    wrapper: (val) => moment(val).format(TIME_FORMAT),
    text: 'Timestamp',
  },

];

const mapStateToProps = ({
  sources: {
    sources,
    totalCount,
  },
  fakeSources: {
    fakeSources,
    totalCount: fakeTotalCount,
  },
  pendingSources: {
    pendingSources,
    totalCount: pendingTotalCount,
  },
  socket,
}) => ({
  sources,
  totalCount,
  fakeSources,
  fakeTotalCount,
  pendingSources,
  pendingTotalCount,
  socket,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSources,
  addSources,
  deleteSources,
  fetchPendingSources,
  addPendingSources,
  deletePendingSources,
  fetchFakeSources,
  addFakeSources,
  deleteFakeSources,
  verifyPendingSource,
}, dispatch);

const ActiveMenuItem = ({
  activeItem,
  sourcesData,
  pendingData,
  fakeData,
  totalCount,
  columns,
  deleteSources,
  fetchSources,
}) => {
  switch (activeItem) {
    case 'news sources': {
      return (
        <DataTable
          defaultSearchFilter="brand"
          label="Sources"
          totalCount={totalCount}
          data={sourcesData}
          columns={columns}
          onDeleteSelected={deleteSources}
          onPaginate={fetchSources}
          addModalContent={<SourcesForm />}
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
                  await this.props.addSources();
                  // this.resetInputVals();
                  closeModal();
                }}
                content="Add All Sources"
              />
            </div>
          )}
          rowActions={(id) => (
            <div>
              {id}
            </div>
          )}
        />
      );
    }
    // case 'pending news sources': {
    //   return <HorizontalBar data={orgsBarData} />;
    // }
    // case 'fake news sources': {
    //   return <HorizontalBar data={locationsBarData} />;
    // }
    default:
      return <p>No Item</p>;
  }
};

class Sources extends Component {
  state = { activeItem: 'news sources' };
  componentDidMount() {
    this.props.fetchSources();
    this.props.fetchPendingSources();
    this.props.fetchFakeSources();
  }

  changeItem = (_, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;
    const {
      sources,
      totalCount,
      fakeSources,
      fakeTotalCount,
      pendingSources,
      pendingTotalCount,
    } = this.props;

    return (
      <div className="sources-container">
        <Menu pointing secondary>
          <Menu.Item name="news sources" active={activeItem === 'news sources'} onClick={this.changeItem} />
          <Menu.Item name="pending news sources" active={activeItem === 'pending news sources'} onClick={this.changeItem} />
          <Menu.Item name="fake news sources" active={activeItem === 'fake news sources'} onClick={this.changeItem} />
        </Menu>
        <ActiveMenuItem
          activeItem={activeItem}
          sourcesData={sources}
          pendingData={pendingSources}
          fakeData={fakeSources}
          totalCount={totalCount}
          pendingTotalCount={pendingTotalCount}
          columns={columns}
          pendingColumns={pendingColumns}
          deleteSources={this.props.deleteSources}
          fetchSources={this.props.fetchSources}
        />
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Segment>
                <Label color="blue" ribbon>News Sources</Label>
                <DataTable
                  defaultSearchFilter="brand"
                  label="Sources"
                  totalCount={totalCount}
                  data={sources}
                  columns={columns}
                  onDeleteSelected={this.props.deleteSources}
                  onPaginate={this.props.fetchSources}
                  addModalContent={<SourcesForm />}
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
                          await this.props.addSources();
                          // this.resetInputVals();
                          closeModal();
                        }}
                        content="Add All Sources"
                      />
                    </div>
                  )}
                  rowActions={(id) => (
                    <div>
                      {id}
                    </div>
                  )}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Segment>
                <Label color="orange" ribbon>Pending News Sources</Label>
                <DataTable
                  defaultSearchFilter="url"
                  label="Pending Source"
                  deleteLabel="Pending Sources"
                  totalCount={pendingTotalCount}
                  data={pendingSources}
                  columns={pendingColumns}
                  onDeleteSelected={this.props.deletePendingSources}
                  onPaginate={this.props.fetchPendingSources}
                  addModalContent={<PendingSourcesForm />}
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
                          await this.props.addPendingSources();
                          // this.resetInputVals();
                          closeModal();
                        }}
                        content="Add All Pending Sources"
                      />
                    </div>
                  )}
                  rowActions={(id) => (
                    <div>
                      <Button
                        color="green"
                        content="Reliable"
                        onClick={() => this.props.verifyPendingSource(id, true)}
                      />
                      <Button
                        color="red"
                        content="Unreliable"
                        onClick={() => this.props.verifyPendingSource(id, false)}
                      />
                    </div>
                  )}
                  hideAddBtn
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Segment>
                <Label color="red" ribbon>Fake News Sources</Label>
                <DataTable
                  defaultSearchFilter="brand"
                  label="Fake Sources"
                  totalCount={fakeTotalCount}
                  data={fakeSources}
                  columns={columns}
                  onDeleteSelected={this.props.deleteFakeSources}
                  onPaginate={this.props.fetchFakeSources}
                  addModalContent={<FakeSourcesForm />}
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
                          await this.props.addFakeSources();
                          // this.resetInputVals();
                          closeModal();
                        }}
                        content="Add All Fake Sources"
                      />
                    </div>
                  )}
                  rowActions={(id) => (
                    <div>
                      {id}
                    </div>
                  )}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sources);

