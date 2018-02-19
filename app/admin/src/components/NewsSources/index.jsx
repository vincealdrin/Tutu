import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Button,
  Menu,
  Modal,
  Label,
  Dimmer,
  Loader,
  Segment,
  List,
} from 'semantic-ui-react';
import moment from 'moment';
import DataTable from '../Common/DataTable';
import SourcesForm from './SourcesForm';
import PendingSourcesForm from './PendingSourcesForm';
import FakeSourcesForm from './FakeSourcesForm';
import PendingActionButton from './PendingActionButton';
import SourcesActionButton from './SourcesActionButton';
import {
  fetchSources,
  addSources,
  deleteSources,
  revoteSource,
} from '../../modules/sources';
import {
  fetchPendingSources,
  addPendingSources,
  deletePendingSources,
  votePendingSource,
  fetchPendingSourceVotes,
  updatePendingSourceVote,
} from '../../modules/pendingSources';
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
  // { key: 'verifiedBy', text: 'Verified by' },
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
    wrapper: (val) => {
      if (val === null) {
        return 'REVOTE';
      }

      return (val ? 'Credible' : 'Not Credible');
    },
    text: 'Prediction/Status',
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
  pendingSources: {
    pendingSources,
    pendingSourceVotes,
    fetchVotesStatus,
    totalCount: pendingTotalCount,
  },
  user: {
    info: { role: userRole, id: userId },
  },
  socket,
}) => ({
  sources,
  totalCount,
  pendingSources,
  pendingTotalCount,
  socket,
  userRole,
  pendingSourceVotes,
  fetchVotesStatus,
  userId,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSources,
  addSources,
  deleteSources,
  fetchPendingSources,
  addPendingSources,
  deletePendingSources,
  votePendingSource,
  fetchPendingSourceVotes,
  revoteSource,
  updatePendingSourceVote,
}, dispatch);

class Sources extends Component {
  state = {
    activeItem: 'pending sources',
    isVotesModalOpen: false,
    isVotesEmpty: false,
    focusedUrl: '',
    focusedLabel: '',
  };

  componentDidMount() {
    const { socket, userId } = this.props;

    socket.on('pendingSourceVote', (vote) => {
      console.log(vote);
      if (userId !== vote.userId) {
        this.props.updatePendingSourceVote(vote);
      }
    });
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners();
  }

  getSegmentColor = () => {
    const { focusedLabel } = this.state;

    if (focusedLabel === 'REVOTE') {
      return 'blue';
    }

    if (focusedLabel === 'CREDIBLE') {
      return 'green';
    }

    return 'red';
  }

  changeItem = (_, { name }) => this.setState({ activeItem: name });

  render() {
    const {
      sources,
      pendingSources,
      totalCount,
      pendingTotalCount,
      pendingSourceVotes,
      userRole,
      fetchVotesStatus,
    } = this.props;
    const {
      activeItem,
      isVotesModalOpen,
      focusedUrl,
      focusedLabel,
      isVotesEmpty,
    } = this.state;

    return (
      <div className="sources-container">
        <Modal
          open={isVotesModalOpen}
          onClose={() => this.setState({ isVotesModalOpen: false })}
          closeOnDimmerClick
        >
          <Modal.Header>
            <a href={focusedUrl} target="_blank">{focusedUrl.replace(/https?:\/\//, '')}</a>&apos;s {focusedLabel} VOTES
          </Modal.Header>
          <Modal.Content>
            <Segment
              color={this.getSegmentColor()}
              style={{ height: fetchVotesStatus.pending ? '15vh' : '100%' }}
            >
              {fetchVotesStatus.success && isVotesEmpty ? (
                <span>NO VOTES</span>
              ) : null}
              {fetchVotesStatus.success ? (
                <List divided relaxed>
                  {pendingSourceVotes.map((vote) => (
                    <List.Item>
                      <List.Header> {vote.user} </List.Header>
                      <List.Description> Comment: {vote.comment} </List.Description>
                    </List.Item>
                  ))}
                </List>
              ) : <Dimmer active> <Loader>LOADING {focusedLabel} VOTES...</Loader> </Dimmer>}
            </Segment>
          </Modal.Content>
        </Modal>

        <Menu pointing secondary>
          <Menu.Item
            name="pending sources"
            active={activeItem === 'pending sources'}
            onClick={this.changeItem}
          />
          <Menu.Item
            name="credible sources"
            active={activeItem === 'credible sources'}
            onClick={this.changeItem}
          />
          <Menu.Item
            name="not credible sources"
            active={activeItem === 'not credible sources'}
            onClick={this.changeItem}
          />
        </Menu>
        {activeItem === 'pending sources' ? (
          <DataTable
            defaultSearchFilter="brand"
            label="Pending Sources"
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
                  content="Add All Sources"
                />
              </div>
            )}
            rowActions={({
              url,
              id,
              vote,
              credibleVotesCount,
              notCredibleVotesCount,
            }) => (
              <Button.Group>
                <Button as="div" labelPosition="left">
                  <Label
                    color="green"
                    pointing="right"
                    onClick={() => {
                      this.setState({
                        isVotesModalOpen: true,
                        focusedUrl: url,
                        focusedLabel: 'CREDIBLE',
                        isVotesEmpty: credibleVotesCount === 0,
                      });
                      this.props.fetchPendingSourceVotes(id, true, true);
                    }}
                    basic
                  >
                    {credibleVotesCount}
                  </Label>
                  <PendingActionButton
                    url={url}
                    onVote={(comment) => {
                      this.props.votePendingSource(id, true, comment);
                    }}
                    vote={vote && vote.isCredible ? vote : null}
                    comment={vote ? vote.comment : ''}
                    isCredible
                  />
                </Button>
                <Button.Or />
                <Button as="div" labelPosition="right">
                  <PendingActionButton
                    url={url}
                    onVote={(comment) => {
                      this.props.votePendingSource(id, false, comment);
                    }}
                    vote={vote && !vote.isCredible ? vote : null}
                    comment={vote ? vote.comment : ''}
                    isCredible={false}
                  />
                  <Label
                    color="red"
                    pointing="left"
                    onClick={() => {
                      this.setState({
                        isVotesModalOpen: true,
                        focusedUrl: url,
                        focusedLabel: 'NOT CREDIBLE',
                        isVotesEmpty: notCredibleVotesCount === 0,
                      });
                      this.props.fetchPendingSourceVotes(id, true, false);
                    }}
                    basic
                  >
                    {notCredibleVotesCount}
                  </Label>
                </Button>

                {/* <Button
                  content={votesCount}
                  color="blue"
                  basic
                /> */}
              </Button.Group>
            )}
            hideActions={userRole !== 'curator'}
            hideDeleteBtn
            initLoad
          />
        ) : null}
        {activeItem === 'credible sources' ? (
          <DataTable
            defaultSearchFilter="brand"
            label="Credible Sources"
            totalCount={totalCount}
            data={sources}
            columns={columns}
            onDeleteSelected={this.props.deleteSources}
            onPaginate={(page, limit, filter, search) => {
              this.props.fetchSources(true, page, limit, filter, search);
            }}
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
            rowActions={({
              url,
              id,
              votesCount,
              vote,
            }) => (
              <Button as="div" labelPosition="left">
                <Label
                  color="blue"
                  pointing="right"
                  onClick={() => {
                    this.setState({
                      isVotesModalOpen: true,
                      focusedUrl: url,
                      focusedLabel: 'REVOTE',
                      isVotesEmpty: votesCount === 0,
                    });
                    this.props.fetchPendingSourceVotes(id, false);
                  }}
                  basic
                >
                  {votesCount}
                </Label>
                <SourcesActionButton
                  url={url}
                  hasVoted={vote}
                  comment={vote ? vote.comment : ''}
                  onClick={(comment) => {
                    this.props.revoteSource(id, comment);
                  }}
                />
              </Button>
            )}
            hideActions={userRole !== 'curator'}
            hideAddBtn
            hideDeleteBtn
            initLoad
          />
        ) : null}
        {activeItem === 'not credible sources' ? (
          <DataTable
            defaultSearchFilter="brand"
            label="Not Credible Sources"
            totalCount={totalCount}
            data={sources}
            columns={columns}
            onDeleteSelected={this.props.deleteFakeSources}
            onPaginate={(page, limit, filter, search) => {
              this.props.fetchSources(false, page, limit, filter, search);
            }}
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
            rowActions={({
              url,
              id,
              votesCount,
              vote,
            }) => (
              <Button as="div" labelPosition="left">
                <Label
                  color="blue"
                  pointing="right"
                  onClick={() => {
                    this.setState({
                      isVotesModalOpen: true,
                      focusedUrl: url,
                      focusedLabel: 'REVOTE',
                      isVotesEmpty: votesCount === 0,
                    });
                    this.props.fetchPendingSourceVotes(id, false);
                  }}
                  basic
                >
                  {votesCount}
                </Label>
                <SourcesActionButton
                  url={url}
                  hasVoted={vote}
                  comment={vote ? vote.comment : ''}
                  onClick={(comment) => {
                    this.props.revoteSource(id, comment);
                  }}
                />
              </Button>
            )}
            hideActions={userRole !== 'curator'}
            hideAddBtn
            hideDeleteBtn
            initLoad
          />
        ) : null}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sources);

