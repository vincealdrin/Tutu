import React, { Component } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

const CarouselArrow = (arrow) => (
  <Button
    color="grey"
    className="carousel-arrow"
    onClick={arrow.onClick}
    size="mini"
  >
    <Icon name={`chevron ${arrow.direction}`} />
  </Button>
);

const CarouselSlide = ({
  slide,
  index,
  activeIndex,
}) => (
  <li
    className={
        index === activeIndex
          ?
          'carousel-slide carousel-slide-active'
          :
          'carousel-slide'
      }
  >
    <div className="carousel-summary">
      <p className="carousel-slide-content">
        {slide}
      </p>
    </div>
  </li>
);

const CarouselSummaryNumber = ({
  index,
  activeIndex,
}) => (
  <li
    className={
        index === activeIndex
          ?
          'carousel-slide carousel-slide-active'
          :
          'carousel-slide'
      }
  >
    <p className="carousel-slide-content article-tags">
        Summary {index + 1}
    </p>
  </li>
);

class Carousel extends Component {
  state = {
    activeIndex: 0,
  };

  goToPreviousSlide = () => {
    let { activeIndex } = this.state;
    const { content = [] } = this.props;
    const summaryLength = content.length;

    this.setState({
      activeIndex: activeIndex < 1 ? activeIndex = summaryLength - 1 : activeIndex - 1,
    });
  }

  goToNextSlide = () => {
    let { activeIndex } = this.state;
    const { content } = this.props;
    const summaryLength = content.length - 1;

    this.setState({
      activeIndex: activeIndex === summaryLength ? activeIndex = 0 : activeIndex + 1,
    });
  }

  render() {
    const { content = [] } = this.props;
    const { activeIndex } = this.state;

    return (
      <div className="carousel">
        <ul className="carousel-slides">
          {content.map((sum, index) => (
            <CarouselSlide
              key={shortid.generate()}
              index={index}
              activeIndex={activeIndex}
              slide={sum}
            />
          ))}
        </ul>

        <div className="carousel-arrows">
          <CarouselArrow onClick={this.goToPreviousSlide} direction="left" />
          <ul className="carousel-slides">
            {content.map((sum, index) => (
              <CarouselSummaryNumber
                key={shortid.generate()}
                index={index}
                activeIndex={activeIndex}
              />
            ))}
          </ul>
          <CarouselArrow onClick={this.goToNextSlide} direction="right" />
        </div>
      </div>
    );
  }
}

export default Carousel;
