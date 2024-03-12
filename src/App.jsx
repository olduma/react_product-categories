/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map((product) => {
  const category = categoriesFromServer
    .find(item => item.id === product.categoryId);
  const user = usersFromServer
    .find(item => item.id === category.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

export const App = () => {
  const [selectedUser, setSelectedUser] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('none'); // none, id, name, category, user
  const [sortDirection, setSortDirection] = useState('asc'); // desc

  let visibleProducts = [...products];

  if (selectedUser !== 'All') {
    visibleProducts = visibleProducts
      .filter(product => product.user.name === selectedUser);
  }

  if (query) {
    visibleProducts = visibleProducts
      .filter(product => product
        .name.toLowerCase().includes(query.trim().toLowerCase()));
  }

  if (selectedCategories.length) {
    visibleProducts = visibleProducts
      .filter(product => selectedCategories.includes(product.category.title));
  }

  if (sortBy !== 'none') {
    visibleProducts.sort((a, b) => {
      if (sortBy === 'id') {
        return sortDirection === 'asc'
          ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
      }

      if (sortBy === 'category') {
        return sortDirection === 'asc'
          ? a.category.title.localeCompare(b.category.title)
          : b.category.title.localeCompare(a.category.title);
      }

      if (sortBy === 'user') {
        return sortDirection === 'asc'
          ? a.user.name.localeCompare(b.user.name)
          : b.user.name.localeCompare(a.user.name);
      }

      return sortDirection === 'asc'
        ? a[sortBy].localeCompare(b[sortBy])
        : b[sortBy].localeCompare(a[sortBy]);
    });
  }

  function handleSortBy(field) {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDirection('asc');
    } else if (sortBy === field && sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortBy('none');
      setSortDirection('asc');
    }
  }

  function handleUserSelect(user) {
    setSelectedUser(user);
  }

  function handleQuery(text) {
    setQuery(text);
  }

  function handleStateReset() {
    setQuery('');
    setSelectedUser('All');
    setSelectedCategories([]);
    setSortBy('none');
    setSortDirection('asc');
  }

  function handlerCategorySelect(title) {
    if (selectedCategories.includes(title)) {
      setSelectedCategories(selectedCategories.filter(item => item !== title));
    } else {
      setSelectedCategories([...selectedCategories, title]);
    }
  }

  function handlerCategoryReset() {
    setSelectedCategories([]);
  }

  function handlerSortIcon(field) {
    if (sortBy === field) {
      return sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }

    return 'fa-sort';
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({
                  'is-active': selectedUser === 'All',
                })}
                onClick={() => handleUserSelect('All')}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({
                    'is-active': selectedUser === user.name,
                  })}
                  onClick={() => handleUserSelect(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={e => handleQuery(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {query && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => handleQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length,
                })}
                onClick={handlerCategoryReset}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.title),
                  })}
                  href="#/"
                  onClick={() => handlerCategorySelect(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleStateReset}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {!visibleProducts.length && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}

          {visibleProducts.length > 0 && (
            <table
              data-cy="ProductTable"
              className={cn('table is-striped is-narrow is-fullwidth', {
                'is-hidden': visibleProducts.length === 0,
              })}
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID

                      <a href="#/" onClick={() => handleSortBy('id')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', handlerSortIcon('id'))}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product

                      <a href="#/" onClick={() => handleSortBy('name')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', handlerSortIcon('name'))}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category

                      <a href="#/" onClick={() => handleSortBy('category')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', handlerSortIcon('category'))}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User

                      <a href="#/" onClick={() => handleSortBy('user')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', handlerSortIcon('user'))}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {`${product.category.icon} - ${product.category.title}`}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.user.sex === 'm',
                        'has-text-danger': product.user.sex === 'f',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
