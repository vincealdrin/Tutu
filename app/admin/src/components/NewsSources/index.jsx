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

const mapStateToProps = ({
  sources: {
    sources,
  },
  socket,
}) => ({
  sources,
  socket,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSources,
  addSources,
  deleteSources,
}, dispatch);

const columns = [
  {
    key: 'dataUrl',
    dkey: (source) => source.contentData.dataUrl,
    wrappers: {
      dataUrl: (val) => (
        <a href={`http://${val}`} target="__blank">{val}</a>
      ),
    },
    text: 'URL',
  },
  { key: 'brand', text: 'Brand' },
];

class Sources extends Component {
  componentDidMount() {
    this.props.fetchSources();
  }

  render() {
    const { sources } = this.props;

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
                  totalCount={5}
                  data={sources}
                  columns={columns}
                  onDeleteSelected={this.props.deleteSources}
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

