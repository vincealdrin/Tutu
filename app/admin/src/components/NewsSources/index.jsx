import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Segment, Grid, Label, Button } from 'semantic-ui-react';
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
} from '../../modules/pendingSources';
import {
  fetchFakeSources,
  addFakeSources,
  deleteFakeSources,
} from '../../modules/fakeSources';
import './styles.css';

const columns = [
  { key: 'brand', text: 'Brand' },
  {
    key: 'url',
    wrappers: {
      url: (val) => (
        <a href={`http://${val}`} target="__blank">{val}</a>
      ),
    },
    text: 'URL',
  },
];
const pendingColumns = [
  { key: 'brand', text: 'Brand' },
  {
    key: 'url',
    wrapper: (val) => (
      <a href={`http://${val}`} target="__blank">{val}</a>
    ),
    text: 'URL',
  },
  {
    key: 'isReliable',
    wrapper: (val) => (val ? 'Yes' : 'No'),
    text: 'Reliable',
  },
  {
    key: 'isConfirmed',
    wrapper: (val) => (val ? 'Yes' : 'No'),
    text: 'Confirmed',
  },
  {
    key: 'timestamp',
    wrapper: (val) => new Date(val).toLocaleString(),
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
    fakeTotalCount,
  },
  pendingSources: {
    pendingSources,
    pendingTotalCount,
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
}, dispatch);

class Sources extends Component {
  componentDidMount() {
    this.props.fetchSources();
    this.props.fetchPendingSources();
    this.props.fetchFakeSources();
  }

  render() {
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
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={8}>
              <Segment>
                <Label color="orange" ribbon>Pending News Sources</Label>
                <DataTable
                  defaultSearchFilter="brand"
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
                />
              </Segment>

            </Grid.Column>
            <Grid.Column width={8}>
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

