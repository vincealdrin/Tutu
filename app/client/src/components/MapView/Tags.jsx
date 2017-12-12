import React, { PureComponent } from 'react';

class Tags extends PureComponent {
  state = { isExpanded: this.props.content.length <= 3 }

  toggleExpand = () => this.setState({ isExpanded: !this.state.isExpanded })

  render() {
    const { content } = this.props;
    const { isExpanded } = this.state;
    const max = isExpanded ? content.length : 3;
    const tags = content.slice(0, max);

    return (
      <div>
        <span className="article-tags">{tags.join(', ')}</span>
        <span className="article-tags see-more" onClick={this.toggleExpand}>
          {`${isExpanded ? 'See Less' : 'See More...'}`}
        </span>
      </div>
    );
  }
}

export default Tags;

