import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

const LogistrationDefaultProps = {
  secondaryProviders: [],
  buttonTitle: '',
};
const LogistrationProps = {
  onSubmitHandler: PropTypes.func.isRequired,
  secondaryProviders: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequried,
    loginUrl: PropTypes.string.isRequired,
  })),
  ButtonTitle: PropTypes.string,
};

export const RenderInstitutionButton = props => {
  const { onSubmitHandler, secondaryProviders, buttonTitle } = props;
  if (secondaryProviders !== undefined && secondaryProviders.length > 0) {
    return (
      <Button
        className="btn-outline-primary submit"
        onClick={onSubmitHandler}
      >
        {buttonTitle}
      </Button>
    );
  }
  return <></>;
};

RenderInstitutionButton.propTypes = {
  ...LogistrationProps,
};
RenderInstitutionButton.defaultProps = {
  ...LogistrationDefaultProps,
};

const InstitutionLogistration = props => {
  const {
    onSubmitHandler,
    secondaryProviders,
    headingTitle,
    buttonTitle,
  } = props;

  return (
    <>
      <div className="d-flex justify-content-center institution-login-container">
        <div className="d-flex flex-column" style={{ width: '450px' }}>
          <p className="mt-5 ml-3 mb-4" style={{ color: '#23419f', fontSize: '20px' }}>
            {headingTitle}
          </p>
          <div style={{ fontSize: '16px' }}>
            <p className="mb-2" style={{ fontSize: '16px' }}>Choose your institution from the list below:</p>
            <div className="mb-2 ml-2">
              <ul>
                {secondaryProviders.map(
                  provider => <li key={provider}><a href={provider.loginUrl}>{provider.name}</a></li>,
                )}
              </ul>
            </div>
          </div>
          <div className="section-heading-line mb-4">
            <h4>or</h4>
          </div>
          <Button
            className="btn-outline-primary submit"
            onClick={onSubmitHandler}
          >
            {buttonTitle}
          </Button>
        </div>
      </div>
    </>
  );
};

InstitutionLogistration.propTypes = {
  ...LogistrationProps,
  headingTitle: PropTypes.string,
};
InstitutionLogistration.defaultProps = {
  ...LogistrationDefaultProps,
  headingTitle: '',
};

export default InstitutionLogistration;
