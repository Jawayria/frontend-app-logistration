import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import * as auth from '@edx/frontend-platform/auth';
import { resetPassword } from '../data/actions';

import ResetPasswordPage from '../ResetPasswordPage';

jest.mock('../data/selectors', () => jest.fn().mockImplementation(() => ({ resetPasswordSelector: () => ({}) })));
jest.mock('@edx/frontend-platform/auth');

const IntlResetPasswordPage = injectIntl(ResetPasswordPage);
const mockStore = configureStore();


describe('ResetPasswordPage', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore();
    props = {
      resetPassword: jest.fn(),
      status: null,
      token_status: 'pending',
      token: null,
      errors: null,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should match reset password default section snapshot', () => {
    props = {
      ...props,
      token: 'token',
      token_status: 'valid',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match invalid token message section snapshot', () => {
    props = {
      ...props,
      token_status: 'invalid',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match successful reset message section snapshot', () => {
    props = {
      ...props,
      token_status: 'valid',
      status: 'success',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match unsuccessful reset message section snapshot', () => {
    props = {
      ...props,
      token_status: 'valid',
      status: 'failure',
      errors: 'Password reset was unsuccessfull.',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display invalid password message', async () => {
    const validationMessage = 'This password is too short. It must contain at least 8 characters. This password must contain at least 1 number.';
    const data = {
      validation_decisions: {
        password: validationMessage,
      },
    };
    props = {
      ...props,
      token_status: 'valid',
    };

    auth.getHttpClient = jest.fn(() => ({
      post: async () => ({
        data,
        catch: () => {},
      }),
    }));

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    await act(async () => {
      await resetPasswordPage.find('input#reset-password-input').simulate('blur');
    });
    resetPasswordPage.update();
    expect(resetPasswordPage.find('#reset-password-input-invalid-feedback').text()).toEqual(validationMessage);
  });

  it('with valid inputs resetPassword action is dispatch', () => {
    const newPassword = 'test-password1';
    store = mockStore({
      ...store,
    });

    props = {
      ...props,
      token_status: 'valid',
      token: 'token',
    };

    const formPayload = {
      new_password1: newPassword,
      new_password2: newPassword,
    };

    store.dispatch = jest.fn(store.dispatch);
    const resetPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPage.find('input#reset-password-input').simulate('blur', { target: { value: newPassword } });
    resetPage.find('input#confirm-password-input').simulate('change', { target: { value: newPassword } });
    resetPage.find('button.submit').simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith(resetPassword(formPayload, props.token, {}));
    resetPage.unmount();
  });

  it('show spinner component during token validation', () => {
    props = {
      ...props,
      token_status: 'pending',
      match: {
        params: {
          token: 'test-token',
        },
      },
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
