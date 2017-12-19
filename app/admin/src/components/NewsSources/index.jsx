import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Segment, Grid, Label, Button } from 'semantic-ui-react';
import DataTable from '../Common/DataTable';
import SourcesForm from './SourcesForm';
import {
  fetchSources,
  addSources,
  deleteSources,
} from '../../modules/sources';
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


const mapStateToProps = ({
  sources: {
    sources,
    totalCount,
  },
  socket,
}) => ({
  sources,
  totalCount,
  socket,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSources,
  addSources,
  deleteSources,
}, dispatch);

class Sources extends Component {
  componentDidMount() {
    this.props.fetchSources();
  }

  render() {
    const { sources, totalCount } = this.props;

    return (
      <div className="sources-container">
        <Grid>
          <Grid.Row>
            <Grid.Column width={7}>
              <Segment>
                <Label color="orange" ribbon>Pending News Sources</Label>
                awe
              </Segment>
              <Segment>
                <Label color="red" ribbon>Fake News Sources</Label>
              aweawewae
              </Segment>
            </Grid.Column>

            <Grid.Column width={9}>
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
                  )
                }
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

