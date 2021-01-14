import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LocaleProvider } from '../util';
import { Message } from './Message';
import { Form, Card, Space, Radio } from 'antd';
import styled from 'styled-components';

import { constants, PointTab, LineTab, AreaTab } from './StyleEditor/';


// AntD width settings for grid
const formLayout = {
    labelCol: { span: 24 }, // width of label column in AntD grid settings -> full width = own row inside element
    wrapperCol: { span: 24 } // width of wrapping column in AntD grid settings -> full width = own row inside element
}

const TabSelector = styled(Radio.Group)`
    &&& {
        display: flex;
        flex-basis: 0;
        flex-grow: 1;
    }

    .ant-radio-button-wrapper {
        text-align: center;
        width: 100%;
    }
`;

const StaticForm = styled(Form)`
    width: 400px;

    & > .ant-space {
        width: 100%;
    }
`;


/**
 * @class StyleEditor
 * @calssdesc <StyleEditor>
 * @memberof module:oskari-ui
 * @see {@link module:oskari-ui/util.LocaleProvider|LocaleProvider}
 * @param {Object} props - { }
 *
 * @example <caption>Basic usage</caption>
 * <StyleEditor props={{ ...exampleProps }}/>
 */

export const StyleEditor = (props) => {
    let [form] = Form.useForm();

    // initialize state with propvided style settings to show preview correctly and set default format as point
    const [state, setState] = useState({ ...props.styleSettings });
    
    const [selectedTab, setSelectedTab] = useState(props.format || 'point');

    const formSetCallback = (valueToSet) => form.setFieldsValue(valueToSet); // callback for populating form with provided values
    const stateSetCallback = (newState) => setState({ ...newState}); // callback for setting state of form - with this we force re-render even though state is handled in handler

    props.formHandler.setCallbacks(stateSetCallback, formSetCallback);
    props.formHandler.populateWithStyle(props.styleSettings);  
    //props.formHandler.populateWithStyle(props.formHandler.getCurrentStyle());
    const samiTest = (values) => {
        console.log(values);
        props.onChange(values)
    };

    return (
        <LocaleProvider value={{ bundleKey: constants.LOCALIZATION_BUNDLE }}>
            <Space direction='vertical'>
                <Card>
                    <Message messageKey='VisualizationForm.subheaders.styleFormat' />
                    <TabSelector { ...formLayout } value={selectedTab} onChange={(event) => setSelectedTab(event.target.value) } >
                        <Radio.Button value='point'><Message messageKey='VisualizationForm.point.tabtitle' /></Radio.Button>
                        <Radio.Button value='line'><Message messageKey='VisualizationForm.line.tabtitle' /></Radio.Button>
                        <Radio.Button value='area'><Message messageKey='VisualizationForm.area.tabtitle' /></Radio.Button>
                    </TabSelector>
                    <Card>
                        <StaticForm form={ form } onValuesChange={ samiTest } >
                        { selectedTab === 'point' &&
                            <p>point</p>
                        }
                        { selectedTab === 'line' &&
                            <p>line</p>
                        }
                        { selectedTab === 'area' &&
                            <p>area</p>
                        }
                        </StaticForm>
                    </Card>
                </Card>
            </Space>
        </LocaleProvider>
    );
};
