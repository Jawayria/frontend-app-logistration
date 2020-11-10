import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';

import LoginPage from '../LoginPage';

const IntlLoginPage = injectIntl(LoginPage);
const mockStore = configureStore();

describe('LoginPage', () => {
  const initialState = {
    logistration: {
      forgotPassword: { status: null },
      loginResult: { success: false, redirectUrl: '' },
      thirdPartyAuthContext: { secondaryProviders: [] },
      response_error: null,
    },
  };

  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore(initialState);
    props = {
      loginRequest: jest.fn(),
    };
  });

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match forget password alert message snapshot', () => {
    props = {
      ...props,
      forgotPassword: { status: 'complete', email: 'test@example.com' },
    };
    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display login help button', () => {
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.find('button.field-link').text()).toEqual('Need help signing in?');
  });

  it('updates the error state for invalid email', () => {
    const errorState = { email: null, password: null };
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('button.submit').simulate('click');
    expect(loginPage.find('LoginPage').state('errors')).toEqual(errorState);
  });

  it('updates the error state for invalid password', () => {
    const errorState = { email: '', password: null };
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#loginEmail').simulate('change', { target: { value: 'test@example.com', name: 'email' } });
    loginPage.find('button.submit').simulate('click');
    expect(loginPage.find('LoginPage').state('errors')).toEqual(errorState);
  });

  it('should match url after redirection', () => {
    const dasboardUrl = 'http://test.com/testing-dashboard/';
    store = mockStore({
      ...store,
      logistration: {
        ...store.logistration,
        thirdPartyAuthContext: { secondaryProviders: [] },
        loginResult: {
          success: true,
          redirectUrl: dasboardUrl,
        },
      },
    });
    delete window.location;
    window.location = { href: '' };
    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(dasboardUrl);
  });

  it('should call the componentDidMount lifecycle method', () => {
    const spy = jest.spyOn(LoginPage.WrappedComponent.prototype, 'componentDidMount');

    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(spy).toHaveBeenCalled();
  });

  it('should show error message on 400', () => {
    store = mockStore({
      ...store,
      logistration: {
        ...store.logistration,
        thirdPartyAuthContext: { secondaryProviders: [] },
        loginResult: {
          success: false,
          redirectUrl: '',
        },
        loginError: 'Email or password is incorrect.',
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should show error message on 400 on receiving link', () => {
    store = mockStore({
      ...store,
      logistration: {
        ...store.logistration,
        thirdPartyAuthContext: { secondaryProviders: [] },
        loginResult: {
          success: false,
          redirectUrl: '',
        },
        loginError: 'To be on the safe side, you can reset your password <a href="/reset">here</a> before you try again.\n',
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display institution login button', () => {
    store = mockStore({
      ...store,
      logistration: {
        ...store.logistration,
        loginResult: {
          success: true,
          redirectUrl: '',
        },
        thirdPartyAuthContext: {
          secondaryProviders: [
            {
              id: 'saml-test',
              name: 'Test University',
              loginUrl: '/dummy-auth',
              registerUrl: '/dummy_auth',
            },
          ],
        },
      },
    });
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.text().includes('Use my university info')).toBe(true);
  });

  it('should not display institution login button', () => {
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.text().includes('Use my university info')).toBe(false);
  });

  it('should display institution login page', () => {
    store = mockStore({
      ...store,
      logistration: {
        ...store.logistration,
        loginResult: {
          success: true,
          redirectUrl: '',
        },
        thirdPartyAuthContext: {
          secondaryProviders: [
            {
              id: 'saml-test',
              name: 'Test University',
              loginUrl: '/dummy-auth',
              registerUrl: '/dummy_auth',
            },
          ],
        },
      },
    });
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find('button.submit').at(0).simulate('click', { institutionLogin: true });
    expect(loginPage.text().includes('Test University')).toBe(true);
  });
});
