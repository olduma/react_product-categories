/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map((product) => {
  const category = categoriesFromServer
    .find(item => item.id === product.categoryId);
  const user = category ? usersFromServer
    .find(item => item.id === category.ownerId) : null;

  return {
    ...product,
    category,
    user,
  };
});

export const App = () => {
  const [activeUser, setActiveUser] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState(''); // 'id', 'name', 'category', user
  const [sortOrder, setSortOrder] = useState('asc'); // 'desc'

  let visibleProducts = [...products];

  if (activeUser !== 'All') {
    visibleProducts = visibleProducts
      .filter(product => product.user.name === activeUser);
  }

  if (query) {
    visibleProducts = visibleProducts
      .filter(product => product.name
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()));
  }

  if (selectedCategories.length) {
    visibleProducts = visibleProducts
      .filter(product => selectedCategories.includes(product.category.title));
  }

  if (sortField) {
    visibleProducts = [...visibleProducts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'number') {
        return sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }

  function sortByHandle(field) {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder('asc');
        setSortField('');
      }
    } else {
      setSortField(field);
    }
  }

  function changeIconHandle(field) {
    let iconClass;

    if (sortField === field) {
      if (sortOrder === 'asc') {
        iconClass = 'fa-sort-down';
      } else {
        iconClass = 'fa-sort-up';
      }
    } else {
      iconClass = 'fa-sort';
    }

    return (
      <span className="icon">
        <i data-cy="SortIcon" className={`fas ${iconClass}`} />
      </span>
    );
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
                onClick={() => setActiveUser('All')}
                className={activeUser === 'All' ? 'is-active' : ''}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => setActiveUser(user.name)}
                  className={activeUser === user.name ? 'is-active' : ''}
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
                  onChange={e => setQuery(e.target.value)}
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
                      onClick={() => setQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6',
                  { 'is-outlined': selectedCategories.length })
                }
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  href="#/"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.title),
                  })}
                  onClick={() => {
                    if (!selectedCategories.includes(category.title)) {
                      setSelectedCategories(
                        [...selectedCategories, category.title],
                      );
                    } else {
                      setSelectedCategories(
                        selectedCategories
                          .filter(item => item !== category.title),
                      );
                    }
                  }}

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
                onClick={() => {
                  setActiveUser('All');
                  setQuery('');
                  setSelectedCategories([]);
                  setSortField('');
                  setSortOrder('asc');
                }}
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
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    ID

                    <a href="#/" onClick={() => sortByHandle('id')}>
                      {changeIconHandle('id')}
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Product

                    <a href="#/" onClick={() => sortByHandle('name')}>
                      {changeIconHandle('name')}
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Category

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-up" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    User

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span>
                    </a>
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              { visibleProducts.map(product => (
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
                    className={product.user.sex === 'm'
                      ? 'has-text-link'
                      : 'has-text-danger'
                            }
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
