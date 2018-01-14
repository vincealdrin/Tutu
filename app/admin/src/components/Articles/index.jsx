import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { fetchArticles } from '../../modules/articles';
import DataTable from '../Common/DataTable';

const columns = [
  { key: 'title', text: 'Title' },
  {
    key: 'url',
    text: 'URL',
    wrapper: (val) => (
      <a href={val} target="__blank">{val}</a>
    ),
  },
  {
    key: 'authors',
    text: 'Authors',
    wrapper: (val) => (
      <span>{val.join()}</span>
    ),
  },
  {
    key: 'sourceUrl',
    text: 'Source',
    wrapper: (val) => (
      <a href={val} target="__blank">{val}</a>
    ),
  },
  {
    key: 'publishDate',
    text: 'Publish Date',
    wrapper: (val) => (
      <span>{new Date(val).toLocaleDateString()}</span>
    ),
  },
];

const mapStateToProps = ({
  articles: {
    articles,
    fetchStatus,
    createStatus,
    updateStatus,
    deleteStatus,
    totalCount,
  },
}) => ({
  articles,
  fetchStatus,
  createStatus,
  updateStatus,
  deleteStatus,
  totalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
}, dispatch);

class Articles extends Component {
  componentDidMount() {
    this.props.fetchArticles();
  }

  render() {
    const {
      articles,
      totalCount,
    } = this.props;

    return (
      <div className="articles-container">
        <DataTable
          defaultSearchFilter="title"
          columns={columns}
          data={articles}
          totalCount={totalCount}
          label="Article"
          onDeleteSelected={this.props.deleteArticles}
          onPaginate={this.props.fetchArticles}
          rowActions={(id) => (
            <div>
              {id}
            </div>
          )}
          hideAddBtn
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Articles);
