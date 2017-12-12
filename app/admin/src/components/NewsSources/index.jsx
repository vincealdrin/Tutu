import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import times from 'lodash/times';
import shortid from 'shortid';
import { Input, Segment, Grid, Label, Button } from 'semantic-ui-react';
import DataTable from '../Common/DataTable';
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
  state = {
    inputCount: 1,
    inputVals: [],
  }

  componentDidMount() {
    this.props.fetchSources();
  }

  resetInputVals = () => this.setState({ inputCount: 1, inputVals: [] })
  addInput = () => this.setState({ inputCount: this.state.inputCount + 1 })
  removeInput = () => this.setState({
    inputCount: this.state.inputCount - 1,
    inputVals: this.state.inputVals.slice(0, -1),
  })

  render() {
    const { sources } = this.props;
    const { inputCount, inputVals } = this.state;

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
                  addModalContent={
                    <div>
                      {times(inputCount, (i) => (
                        <Input
                          key={shortid.generate()}
                          icon="world"
                          iconPosition="left"
                          placeholder="Source URL"
                          action={(i + 1) === (inputCount)
                              ? {
                                  color: 'teal',
                                  icon: 'add',
                                  content: 'Add Input',
                                  onClick: this.addInput,
                                }
                              : {
                                color: 'orange',
                                icon: 'remove',
                                content: 'Remove',
                                onClick: this.removeInput,
                              }
                            }
                          onChange={(_, { value }) => {
                            const vals = inputVals;
                            vals[i] = value;
                            this.setState({ inputVals: vals });
                          }}
                          fluid
                        />
                        ))}
                    </div>
                  }
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
                          await this.props.addSources(inputVals);
                          this.resetInputVals();
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

