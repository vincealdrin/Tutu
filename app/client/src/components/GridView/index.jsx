import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import articleItems from '../../modules/articles';
import { Search } from 'semantic-ui-react';
import NewsMenu from '../NewsMenu';
import News from './News';
import './style.css';

class GridLayout extends Component {

  render() {

    return (
      <div>
        <div className="upper-bleed">
          <Search placeholder="Search News..." className="search-bar" />
        </div>
        <NewsMenu />
        <News
					// news={articles}
				/>
      </div>
    );
  }
}

// const mapsStateToProps = (state) => ({
//   articles: state.articleItems,
// });

// const mapDispatchToProps = (dispatch) => bindActionCreators(articleItems, dispatch);

// connect(
//   mapsStateToProps,
//   mapDispatchToProps,
// )(News);

export default GridLayout;
