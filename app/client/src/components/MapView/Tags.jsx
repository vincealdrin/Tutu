import React, { PureComponent } from 'react';

const THRESHOLD = 3;
class Tags extends PureComponent {
  state = { isExpanded: this.props.content.length <= THRESHOLD }

  toggleExpand = () => this.setState({ isExpanded: !this.state.isExpanded })

  render() {
    const { content } = this.props;
    const { isExpanded } = this.state;
    const tags = isExpanded ? content : content.slice(0, THRESHOLD);

    return (
      <div>
        <span className="article-tags">{tags.join(', ')}</span>
        <span color="blue" className="article-tags see-more" onClick={this.toggleExpand}>
          {content.length > THRESHOLD ? `${isExpanded ? 'See Less' : 'See More...'}` : null}
        </span>
      </div>
    );
  }
}

export default Tags;

