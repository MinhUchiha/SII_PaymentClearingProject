/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http','N/record','N/search','N/redirect','N/format', 'N/runtime', 'N/url'],

function(serverWidget, http, record, search, redirect, format, runtime, url) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        try{
            var scriptObj = runtime.getCurrentScript();
            var clientScriptFileId = scriptObj.getParameter({name: 'custscript_paymentmanagement_client_file'})
            var request = context.request;
            var recordId = request.parameters.custscript_custpayment_head_id;
            if (request.method === http.Method.GET) {
                var objRecord = record.load({
                    type: 'customrecord_sii_custpayment_h',
                    id: recordId,
                    isDynamic: true
                });
                var importDate = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_importdate'});
                /*importDate = format.format({
                    value: importDate,
                    type: format.Type.DATE
                });*/
                var importPerson = objRecord.getText({fieldId: 'custrecord_sii_custpayment_importperson'});
                var fromDate = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_date_from'});
                var toDate = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_date_to'});
                var amountSum = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_amountsum'});
                var amountSumString = format.format({
                    value: amountSum,
                    type: format.Type.INTEGER
                });
                var importNumber = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_importnumber'});
                importNumber = format.format({
                    value: importNumber,
                    type: format.Type.INTEGER
                });
                var status = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_status'});
                var nowDate = new Date();
                nowDate = format.format({
                    value: nowDate,
                    type: format.Type.DATE
                });
                var name = objRecord.getValue({fieldId: 'name'});
                // �t�H�[����`
                var form = serverWidget.createForm({
                    title: '�����Ǘ��['
                });
                form.addSubmitButton({
                    label: '�ۑ�'
                });
                form.addButton({
                    id: 'cancelButton',
                    label: '�L�����Z��',
                    functionName: 'btnCancelButton();'
                }); 
                form.addButton({
                    id: 'runButton',
                    label: '���s',
                    functionName: 'btnRunButton();'
                });

                //id
                var head_id = form.addField({
                    id: 'head_id',
                    label: 'id : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.defaultValue = recordId;
                head_id.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                //�捞��
                var labelNowDate = form.addField({
                    id: 'labeldate',
                    label: '�捞�� : ',
                    type: serverWidget.FieldType.TEXT
                });
                labelNowDate.defaultValue = '�捞�� &nbsp;&nbsp;&nbsp;&nbsp;: ';
                labelNowDate.label = '';
                labelNowDate.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                labelNowDate.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                labelNowDate.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                var textNowDate = form.addField({
                    id: 'textdate',
                    label: 'Date',
                    type: serverWidget.FieldType.DATE
                });
                textNowDate.defaultValue = importDate;
                textNowDate.label = '';
                textNowDate.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                textNowDate.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                textNowDate.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                                          
                //������
                var paymentDate = form.addField({
                    id: 'paymentdate',
                    label: '������ : ',
                    type: serverWidget.FieldType.TEXT
                });
                paymentDate.defaultValue = '������ &nbsp;&nbsp;&nbsp;&nbsp;: ';
                paymentDate.label = '';
                paymentDate.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                paymentDate.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                paymentDate.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                
                var paymentDateFrom = form.addField({
                    id: 'paymentdatefrom',
                    label: nowDate,
                    type: serverWidget.FieldType.DATE
                });
        
                paymentDateFrom.defaultValue = fromDate;
                paymentDateFrom.label = '';
                
                
                paymentDateFrom.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                paymentDateFrom.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                //�捞�S����
                var labelUser = form.addField({
                    id: 'labeluser',
                    label: '�捞�S���� : ',
                    type: serverWidget.FieldType.TEXT
                });
                
                labelUser.defaultValue = "<span style='margin-left: 300px'>�捞�S����&nbsp;&nbsp;&nbsp;:</span>";
                labelUser.label = '';
                labelUser.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                labelUser.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                labelUser.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                var textUser = form.addField({
                    id: 'textuser',
                    label: '�c��ǒm',
                    type: serverWidget.FieldType.TEXT
                });
                textUser.defaultValue = importPerson;
                textUser.label = '';
                textUser.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                
                textUser.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                textUser.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var paymentSpace = form.addField({
                    id: 'paymentspace',
                    label: '~',
                    type: serverWidget.FieldType.TEXT
                });
                paymentSpace.defaultValue = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                paymentSpace.label = '';
                paymentSpace.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                paymentSpace.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE                    
                });
                paymentSpace.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                
                var paymentDateTo = form.addField({
                    id: 'paymentdateto',
                    label: nowDate,
                    type: serverWidget.FieldType.DATE
                });
        
                paymentDateTo.defaultValue = toDate;
                paymentDateTo.label = '';
                
                
                paymentDateTo.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                paymentDateTo.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                //�捞����
                var labelNumber = form.addField({
                    id: 'labelnumber',
                    label: '�捞���� : ',
                    type: serverWidget.FieldType.TEXT
                });
                
                labelNumber.defaultValue = "<span style='margin-left: 300px'>�捞����&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span>";
                labelNumber.label = '';
                labelNumber.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                labelNumber.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                labelNumber.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
 
                var textNumber = form.addField({
                    id: 'textnumber',
                    label: 'textNumber',
                    type: serverWidget.FieldType.TEXT
                });
                textNumber.defaultValue = importNumber;
                textNumber.label = '';
                textNumber.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                
                textNumber.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                textNumber.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                
                //�X�e�[�^�X
                var labelStatus = form.addField({
                    id: 'labelstatus',
                    label: '�X�e�[�^�X : ',
                    type: serverWidget.FieldType.TEXT
                });
                labelStatus.defaultValue = '�X�e�[�^�X : ';
                labelStatus.label = '';
                labelStatus.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                labelStatus.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                labelStatus.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var textStatus = form.addField({
                    id: 'textstatus',
                    label: nowDate,
                    type: serverWidget.FieldType.TEXT
                });
                if(status == 2){
                    textStatus.defaultValue = "�捞���s";
                }else{
                    textStatus.defaultValue = "����捞";
                }
                textStatus.label = '';
                textStatus.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                textStatus.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                textStatus.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                
                //���v���z
                var labelTotal = form.addField({
                    id: 'labeltotal',
                    label: '���v���z : ',
                    type: serverWidget.FieldType.TEXT
                });
                
                labelTotal.defaultValue = "<span style='margin-left: 365px'>���v���z&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span>";
                labelTotal.label = '';
                labelTotal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                labelTotal.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                labelTotal.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
 
                var textTotal = form.addField({
                    id: 'texttotal',
                    label: '���v���z',
                    type: serverWidget.FieldType.TEXT
                });
                textTotal.label = '';
                textTotal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                
                textTotal.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                textUser.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                // �����Ǘ��ꗗ
                var paymentSubList  = form.addSublist({
                    id: 'payment_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: '�����Ǘ��ꗗ'
                });

                paymentSubList.addField({
                    id: 'id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID'
                }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN});
                paymentSubList.addField({
                    id: 'sub_list_check',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '��'
                });
                paymentSubList.addField({
                    id: 'sub_list_id',
                    type: serverWidget.FieldType.TEXT,
                    label: '�����ԍ�'
                });
                paymentSubList.addField({
                    id: 'sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: '���Ӑ�No.'
                });
                var customerSelect = paymentSubList.addField({
                    id: 'sub_list_3',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: '�ڋq'
                });
                paymentSubList.addField({
                    id: 'sub_list_4',
                    type: serverWidget.FieldType.DATE,
                    label: '������'
                });
                paymentSubList.addField({
                    id: 'sub_list_5',
                    type: serverWidget.FieldType.TEXT,
                    label: '��s'
                });
                paymentSubList.addField({
                    id: 'sub_list_6',
                    type: serverWidget.FieldType.TEXT,
                    label: '�x�X'
                });
                paymentSubList.addField({
                    id: 'sub_list_7',
                    type: serverWidget.FieldType.TEXT,
                    label: '�˗��l'
                });
                paymentSubList.addField({
                    id: 'sub_list_8',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�����z'
                });
                paymentSubList.addField({
                    id: 'sub_list_9',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�����v'
                });
                paymentSubList.addField({
                    id: 'sub_list_10',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '��v'
                });
                paymentSubList.addField({
                    id: 'sub_list_11',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '�����'
                });
                paymentSubList.addField({
                    id: 'sub_list_12',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: '�萔��'
                });
                paymentSubList.addField({
                    id: 'sub_list_13',
                    type: serverWidget.FieldType.TEXT,
                    label: '���z�������i�[�G���A'
                }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                var i = 0;
                var totalamount = 0;
                var resultSet = getPaymentList(recordId)
                resultSet.each(function(result) {
                    var sub_list_id = result.getValue({
                        name: 'custrecord_sii_custpayment_depositnum'
                    });
                    var exclusion = result.getValue({
                        name: 'custrecord_sii_custpayment_exclusion'
                    });
                    var customerno = result.getValue({
                        name: 'custrecord_sii_custpayment_customerno'});
                    var client = result.getValue({
                        name: 'custrecord_sii_custpayment_client'
                    });
                    var paymentdate = result.getValue({
                        name: 'custrecord_sii_custpayment_paymentdate'
                    });
                    var bank = result.getValue({
                        name: 'custrecord_sii_custpayment_bank'
                    });
                    var branchoff = result.getValue({
                        name: 'custrecord_sii_custpayment_branchoff'
                    });
                    var request = result.getValue({
                        name: 'custrecord_sii_custpayment_request'
                    });
                    var paymentamo = result.getValue({
                        name: 'custrecord_sii_custpayment_paymentamo'
                    });
                    var claimsum = result.getValue({
                        name: 'custrecord_sii_custpayment_claimsum'
                    });
                    var match = result.getValue({
                        name: 'custrecord_sii_custpayment_match'
                    });
                    var consumption = result.getValue({
                        name: 'custrecord_sii_custpayment_consumption'
                    });
                    var fee = result.getValue({
                        name: 'custrecord_sii_custpayment_fee'
                    });
                    paymentSubList.setSublistValue({
                        id: 'id',
                        line: i,
                        value: result.id
                    });
                    if(exclusion){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_check',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_check',
                            line: i,
                            value: 'F'
                        });
                        if(checkDate(paymentdate, fromDate, toDate)){
                            totalamount += parseInt(paymentamo);
                        }
                    }
                    var output = url.resolveScript({
                        scriptId: 'customscript_sii_sl_paymentadjustment',
                        deploymentId: 'customdeploy_sii_sl_paymentadjustment',
                        returnExternalUrl: false,
                        params: {'custscript_custpayment_id': result.id}
                    })
                    paymentSubList.setSublistValue({
                        id: 'sub_list_id',
                        line: i,
                        value: '<a href="'+output+'">'+sub_list_id+'</a>'
                    });
                    if(customerno == null || customerno == ''){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_2',
                            line: i,
                            value: ' '
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_2',
                            line: i,
                            value: customerno
                        });
                    }
                    if(client == null || client == ''){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_3',
                            line: i,
                            value: 0
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_3',
                            line: i,
                            value: client
                        });
                    }
                    paymentSubList.setSublistValue({
                        id: 'sub_list_4',
                        line: i,
                        value: paymentdate
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_5',
                        line: i,
                        value: bank
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_6',
                        line: i,
                        value: branchoff
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_7',
                        line: i,
                        value: request
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_8',
                        line: i,
                        value: paymentamo
                    });
                    if(claimsum == null || claimsum == ''){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_9',
                            line: i,
                            value: 0
                    });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_9',
                            line: i,
                            value: claimsum
                        });
                    }
                    if(match){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_10',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_10',
                            line: i,
                            value: 'F'
                        });
                    }
                    if(consumption){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_11',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_11',
                            line: i,
                            value: 'F'
                        });
                    }
                    if(fee){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_12',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_12',
                            line: i,
                            value: 'F'
                        });
                    }
                    i++
                    return true;
                });
                totalamount = format.format({
                    value: totalamount,
                    type: format.Type.INTEGER
                });
                textTotal.defaultValue = totalamount;
                var tab = form.addTab({
                    id : 'tabid',
                    label : 'Tab'
                });
                //�萔������
                var commissionSubtab = form.addSubtab({
                    id : 'commission',
                    label : '�萔������',
                    tab: 'tabid'
                });
              
                var fee_account_item_label = form.addField({
                    id: 'fee_account_item_label',
                    label: '�萔������Ȗ�',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                fee_account_item_label.defaultValue = '�萔������Ȗ�';
                fee_account_item_label.label = '';
                fee_account_item_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                fee_account_item_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                fee_account_item_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var fee_account_item = form.addField({
                    id: 'fee_account_item',
                    type: serverWidget.FieldType.SELECT,
                    label: 'fee_account_item',
                    source: 'account',
                    container: 'commission'
                });
                fee_account_item.label = '';

                
                fee_account_item.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                fee_account_item.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var tax_code_label = form.addField({
                    id: 'tax_code_label',
                    label: '����ŃR�[�h',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                tax_code_label.defaultValue = '����ŃR�[�h&nbsp;&nbsp;';
                tax_code_label.label = '';
                tax_code_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                tax_code_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_code_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var tax_code = form.addField({
                    id: 'tax_code',
                    label: 'tax_code',
                    type: serverWidget.FieldType.SELECT,
                    source: 'salestaxitem',
                    container: 'commission'
                });
                    
                tax_code.label = '';

                
                tax_code.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_code.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var tax_category_label = form.addField({
                    id: 'tax_category_label',
                    label: '����ŃJ�e�S�� ',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                tax_category_label.defaultValue = '����ŃJ�e�S�� ';
                tax_category_label.label = '';
                tax_category_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                tax_category_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_category_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var tax_category = form.addField({
                    id: 'tax_category',
                    label: 'tax_category',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customlist_4572_main_tax_category',
                    container: 'commission'
                });
                    
                tax_category.label = '';

                
                tax_category.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_category.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                //�덷�Ή�
                var errorSubtab = form.addSubtab({
                    id : 'error_subtab',
                    label : '�덷�Ή�',
                    tab: 'tabid'
                });
              
                var error_difference_label = form.addField({
                    id: 'error_difference_label',
                    label: '�덷�F�����z',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                error_difference_label.defaultValue = '�덷�F�����z';
                error_difference_label.label = '';
                error_difference_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                error_difference_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                error_difference_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var error_difference = form.addField({
                    id: 'error_difference',
                    label: 'error_difference',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                error_difference.defaultValue = '10';
                    
                error_difference.label = '';

                
                error_difference.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                error_difference.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var plus_error_label = form.addField({
                    id: 'plus_error_label',
                    label: '�v���X�덷',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                plus_error_label.defaultValue = '�v���X�덷 &nbsp;';
                plus_error_label.label = '';
                plus_error_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                plus_error_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                plus_error_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var plus_error = form.addField({
                    id: 'plus_error',
                    label: 'plus_error',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    container: 'error_subtab'
                });
                    
                plus_error.label = '';

                
                plus_error.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                plus_error.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var minus_error_label = form.addField({
                    id: 'minus_error_label',
                    label: '�}�C�i�X�덷 ',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                minus_error_label.defaultValue = '�}�C�i�X�덷 ';
                minus_error_label.label = '';
                minus_error_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                minus_error_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                minus_error_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var minus_error = form.addField({
                    id: 'minus_error',
                    label: 'minus_error',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    container: 'error_subtab'
                });
                    
                minus_error.label = '';

                
                minus_error.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                minus_error.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                var settingList = getSetting();
                var setting = settingList.getRange({
                    start: 0,
                    end: 1
                })[0];
                var taxCoSetting = setting.getValue({name: 'custrecord_sii_custpayment_setting_taxco'});
                tax_code.defaultValue = taxCoSetting;
                var taxCaSetting = setting.getValue({name: 'custrecord_sii_custpayment_setting_taxca'});
                tax_category.defaultValue = taxCaSetting
                var acc = setting.getValue({name: 'custrecord_sii_custpayment_setting_acc'});
                fee_account_item.defaultValue = acc;
                var plus = setting.getValue({name: 'custrecord_sii_custpayment_setting_plus'})
                plus_error.defaultValue = plus;
                var minus = setting.getValue({name: 'custrecord_sii_custpayment_setting_minus'})
                minus_error.defaultValue = minus;
                form.clientScriptFileId = clientScriptFileId;
                context.response.writePage(form);
            }else{
                var id = context.request.parameters.head_id;
                var texttotal = context.request.parameters.texttotal
                var saveRecord = record.load({
                    type: 'customrecord_sii_custpayment_h',
                    id: id
                });
                var dateFrom = context.request.parameters.paymentdatefrom;
                if(dateFrom != null && dateFrom != ''){
                    dateFrom = format.parse({
                        value: dateFrom,
                        type: format.Type.DATE
                    });
                    dateFrom = new Date(dateFrom);
                    saveRecord.setValue({
                        fieldId: 'custrecord_sii_custpayment_date_from',
                        value: dateFrom
                    });
                }
                var dateTo = context.request.parameters.paymentdateto;
                if(dateTo != null && dateTo != ''){
                    dateTo = format.parse({
                        value: dateTo,
                        type: format.Type.DATE
                    });
                    dateTo = new Date(dateTo)
                    saveRecord.setValue({
                        fieldId: 'custrecord_sii_custpayment_date_to',
                        value: dateTo
                    })
                }
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_amountsum',
                    value: getInt(texttotal)
                })
                saveRecord.save();
                var id = context.request.parameters.head_id;
                redirect.toRecord({
                    type : 'customrecord_sii_custpayment_h',
                    id : id
                });
            }
            
        }catch(e){
            log.error({
                title: e.name,
                details: e.message
            });
        }
    }

    function getPaymentList(paymentListHeadId){
        var myPaymentListSearch = search.create({
            type: 'customrecord_sii_custpayment',
            columns: [{
                name: 'custrecord_sii_custpayment_depositnum',
                sort: search.Sort.ASC
            }, {
                name: 'custrecord_sii_custpayment_exclusion'
            }, {
                name: 'custrecord_sii_custpayment_depositacc'
            }, {
                name: 'custrecord_sii_custpayment_customerno'
            }, {
                name: 'custrecord_sii_custpayment_client'
            }, {
                name: 'custrecord_sii_custpayment_paymentdate'
            },{
                name: 'custrecord_sii_custpayment_bank'
            },{
                name: 'custrecord_sii_custpayment_branchoff'
            },{
                name: 'custrecord_sii_custpayment_request'
            },{
                name: 'custrecord_sii_custpayment_paymentamo'
            },{
                name: 'custrecord_sii_custpayment_claimsum'
            },{
                name: 'custrecord_sii_custpayment_match'
            },{
                name: 'custrecord_sii_custpayment_consumption'
            },{
                name: 'custrecord_sii_custpayment_fee'
            }],
            filters: [{
                name: 'custrecord_sii_custpayment_h_id',
                operator: search.Operator.IS,
                values: [paymentListHeadId]
            }]
        });
        var resultSet = myPaymentListSearch.run();
        return( myPaymentListSearch.run() );
    }

    function getSetting(){
        var mysearch = search.create({
            type: 'customrecord_sii_custpayment_setting',
            columns: [{
                name: 'custrecord_sii_custpayment_setting_acc'
            },{
                name: 'custrecord_sii_custpayment_setting_taxco'
            },{
                name: 'custrecord_sii_custpayment_setting_taxca'
            },{
                name: 'custrecord_sii_custpayment_setting_error'
            },{
                name: 'custrecord_sii_custpayment_setting_plus'
            },{
                name: 'custrecord_sii_custpayment_setting_minus'
            }]
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

    function getInt(stringNumber){
        stringNumber = stringNumber.split(",");
        var stringtotal = '';
        stringNumber.forEach(function(item, index){
            stringtotal = stringtotal+item;
        });
        stringNumber = parseInt(stringtotal);
        return stringNumber;
    }

    function checkDate(paymentDate, fromDate, toDate){
        if(fromDate != null && fromDate != ''){
            if(toDate != null && toDate != ''){
                if(paymentDate >= fromDate && paymentDate <= toDate){
                    return true;
                }else{
                    return false;
                }
            }else{
                if(paymentDate >= fromDate){
                    return true;
                }else{
                    return false;
                }
            }
        }else{
            if(toDate != null && toDate != ''){
                if(paymentDate <= toDate){
                    return true;
                }else{
                    return false;
                }
            }else{
                if(paymentDate >= fromDate){
                    return true;
                }else{
                    return false;
                }
            }
        }
    }

    return {
        onRequest: onRequest
    };
    
});
