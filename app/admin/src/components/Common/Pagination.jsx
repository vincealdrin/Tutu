import * as React from 'react';
import { createUltimatePagination, ITEM_TYPES } from 'react-ultimate-pagination';
import { Menu } from 'semantic-ui-react';

const Page = ({ value, isActive, onClick }) => (
  <Menu.Item content={value.toString()} active={isActive} onClick={onClick} />
);

const Ellipsis = ({ onClick }) => (
  <Menu.Item content="..." onClick={onClick} />
);

const FirstPageLink = ({ onClick }) => (
  <Menu.Item icon="angle double left" onClick={onClick} />
);

const PreviousPageLink = ({ onClick }) => (
  <Menu.Item icon="angle left" onClick={onClick} />
);

const NextPageLink = ({ onClick }) => (
  <Menu.Item icon="angle right" onClick={onClick} />
);

const LastPageLink = ({ onClick }) => (
  <Menu.Item icon="angle double right" onClick={onClick} />
);

const Wrapper = ({ children }) => (
  <Menu floated="right" pagination>
    {children}
  </Menu>
);

const itemTypeToComponent = {
  [ITEM_TYPES.PAGE]: Page,
  [ITEM_TYPES.ELLIPSIS]: Ellipsis,
  [ITEM_TYPES.FIRST_PAGE_LINK]: FirstPageLink,
  [ITEM_TYPES.PREVIOUS_PAGE_LINK]: PreviousPageLink,
  [ITEM_TYPES.NEXT_PAGE_LINK]: NextPageLink,
  [ITEM_TYPES.LAST_PAGE_LINK]: LastPageLink,
};

const Pagination = createUltimatePagination({
  itemTypeToComponent,
  WrapperComponent: Wrapper,
});

export default Pagination;
