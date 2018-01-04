/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http','N/record','N/search','N/redirect','N/format','N/runtime'],

function(serverWidget, http, record, search, redirect, format, runtime) {
   
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
            var request = context.request;
            if (request.method === http.Method.GET) {
              //Get parameter
              var recordId = request.parameters.custscript_custpayment_id;
              var feeParameters = request.parameters.fee;
              var consumptionParameters = request.parameters.consumption;

                var objRecord = record.load({
                    type: 'customrecord_sii_custpayment',
                    id: recordId
                });
                var scriptObj = runtime.getCurrentScript();
                var clientScriptFileId = scriptObj.getParameter({
                  name: 'custscript_paymentadjustment_client_file'
                });
                var customer = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_client'
                });
                var paymentamo = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_paymentamo'
                });
                var custpayment_h_id = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_h_id'
                });
                var saving = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_saving'
                });
                // �t�H�[����`
                var form = serverWidget.createForm({
                    title: '�����[���z����'
                });
                form.addSubmitButton({
                    label: '�ۑ�'
                });
                form.addButton({
                    id: 'cancelButton',
                    label: '�L�����Z��',
                    functionName: 'btnReturnButton();'
                }); 
                
                var nowDate = new Date();
                nowDate = format.format({
                    value: nowDate,
                    type: format.Type.DATE
                });
                var head_id = form.addField({
                    id: 'head_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                head_id.defaultValue = custpayment_h_id;
                var payment_id = form.addField({
                    id: 'payment_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                payment_id.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                payment_id.defaultValue = recordId;

                if(saving != '' && saving != null){
                    var saveCustomer = JSON.parse(saving).client;
                    if(saveCustomer != '' && saveCustomer != null){
                        customer = saveCustomer;
                    }
                }

                //�ڋq
                var customerField = form.addField({
                    id: 'customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: '�ڋq'
                });

                customerField.defaultValue = customer;
                customerField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                var dueDateFrom = form.addField({
                    id: 'duedatefrom',
                    label: '���� (FROM)',
                    type: serverWidget.FieldType.DATE
                });
                
                var dueDateTo = form.addField({
                    id: 'duedateto',
                    label: '���� (TO)',
                    type: serverWidget.FieldType.DATE
                });
        

                var total_text = form.addField({
                    id: 'total_text',
                    label: '���v',
                    type: serverWidget.FieldType.TEXT
                });
        
                total_text.defaultValue = format.format({
                    value: paymentamo,
                    type: format.Type.INTEGER
                });
                total_text.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });
                total_text.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var fee = form.addField({
                    id : 'fee',
                    type : serverWidget.FieldType.INTEGER,
                    label : '�萔��'
                });
                if(feeParameters != null && feeParameters != ''){
                    fee.defaultValue = feeParameters;
                }
                var calculation_error = form.addField({
                    id : 'calculation_error',
                    type : serverWidget.FieldType.INTEGER,
                    label : '�v�Z�덷'
                });
                if(consumptionParameters != null && consumptionParameters != ''){
                    calculation_error.defaultValue = consumptionParameters;
                }

              //�K�p�\�z
              var applicable_amount = form.addField({
                id: 'applicable_amount',
                label: '�K�p�\�z',
                type: serverWidget.FieldType.TEXT
              });

              applicable_amount.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.STARTROW
              });
              applicable_amount.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
              });

              var subtab = form.addSubtab({
                        id : 'custpage_subtab',
                        label : '�������ꗗ'
                });

                var invoiceSubList  = form.addSublist({
                    id: 'invoice_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: '�������ꗗ',
                    tab: 'custpage_subtab'
                });
               
                var sub_list_check = invoiceSubList.addField({
                    id: 'sub_list_check',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ff'
                });
                sub_list_check.label = '';
                invoiceSubList.addField({
                    id: 'sub_list_id',
                    type: serverWidget.FieldType.TEXT,
                    label: '�����ԍ�'
                });
                invoiceSubList.addField({
                    id: 'id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'invoiceID'
                });
                invoiceSubList.addField({
                    id: 'sub_list_1',
                    type: serverWidget.FieldType.DATE,
                    label: '����'
                });
                invoiceSubList.addField({
                    id: 'entity',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    label: '����Ȗ�'
                });
                invoiceSubList.addField({
                    id: 'sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: '����'
                });
                invoiceSubList.addField({
                    id: 'sub_list_3',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '�����z'
                });
                invoiceSubList.addField({
                    id: 'sub_list_4',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�K�p�z'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_5',
                    type: serverWidget.FieldType.INTEGER,
                    label: '�����z'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                var sub_list_6 = invoiceSubList.addField({
                    id: 'sub_list_6',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ff '
                });
                sub_list_6.label = '';
                invoiceSubList.addField({
                    id: 'sub_list_7',
                    type: serverWidget.FieldType.INTEGER,
                    label: '���K�p'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_8',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    label: '��p����Ȗ�'
                });
                invoiceSubList.addField({
                    id: 'sub_list_9',
                    type: serverWidget.FieldType.SELECT,
                    source: 'salestaxitem',
                    label: '�����'
                });
                var invoiceList = getInvoiceList();
                invoiceSubList.addField({
                    id: 'sub_list_10',
                    type: serverWidget.FieldType.SELECT,
                    label: '����ŃJ�e�S��',
                    source: 'customlist_4572_main_tax_category',
                });

                var i = 0;
                invoiceList.each(function(result) {
                    var invoiceCustomer = result.getValue(invoiceList.columns[0]);
                    var tranid = result.getValue(invoiceList.columns[2]);
                    var duedate = result.getValue(invoiceList.columns[7]);
                    var amount = result.getValue(invoiceList.columns[3]);
                    var amountremaining = result.getValue(invoiceList.columns[4]);
                    var department = result.getText(invoiceList.columns[6]);
                    var entity = result.getValue(invoiceList.columns[8]);
                    if(invoiceCustomer === customer ){
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_id',
                            line: i,
                            value: tranid
                        });
                        invoiceSubList.setSublistValue({
                            id: 'id',
                            line: i,
                            value: result.id
                        });
                        if(duedate != null && duedate !== ''){
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_1',
                                line: i,
                                value: duedate
                            });
                        }
                        if(entity != null && entity != ''){
                            invoiceSubList.setSublistValue({
                                id: 'entity',
                                line: i,
                                value: entity
                            });
                        }
                        if(department != '' && department != null){
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_2',
                                line: i,
                                value: department
                            });
                        }
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_3',
                            line: i,
                            value: amountremaining
                        });
                        var applied = 0;
                        if(paymentamo < amountremaining){
                            applied = parseInt(paymentamo);
                            paymentamo = 0;
                        }else{
                            applied = parseInt(amountremaining);
                            paymentamo = paymentamo - amountremaining;
                        }
                        if(applied != 0){
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_4',
                                line: i,
                                value: applied.toString()
                            });
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_check',
                                line: i,
                                value: 'T'
                            });
                        }
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_6',
                            line: i,
                            value: 'F'
                        });
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_7',
                            line: i,
                            value: (amountremaining - applied).toString()
                        });
                        var settingRecord = record.load({
                            type: 'customrecord_sii_custpayment_setting',
                            id: 1
                        });
                        var acc = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_s_acc'});
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_8',
                            line: i,
                            value: acc
                        });
                        var taxco = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_taxco'})
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_9',
                            line: i,
                            value: taxco
                        });
                        var taxCaSetting = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_taxca'});
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_10',
                            line: i,
                            value: taxCaSetting
                        });
                        i++;
                    }
                    return true;
                });
                applicable_amount.defaultValue = format.format({
                    value: paymentamo,
                    type: format.Type.INTEGER
                });
                form.clientScriptFileId = clientScriptFileId;
                context.response.writePage(form);
            }else{//POST
                var serverRequest = context.request;
                var lines = serverRequest.getLineCount({ group: "invoice_sub_list" });
                var  array = [];
                for(var i = 0; i < lines; i++){
                    var id = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'id',
                        line: i
                    });
                    var check = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_check',
                        line: i
                    });
                    var applied = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_4',
                        line: i
                    });
                    var adjustment = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_5',
                        line: i
                    });
                    var check_2 = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_6',
                        line: i
                    });
                    var account = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_8',
                        line: i
                    });
                    var taxco = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_9',
                        line: i
                    });
                    var taxCaSetting = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_10',
                        line: i
                    });
                    var jsonSave = {
                        "id":id,
                        "check":check,
                        "applied":applied,
                        "adjustment":adjustment,
                        "check_2":check_2,
                        "account":account,
                        "taxco":taxco,
                        "taxCaSetting":taxCaSetting
                    };
                    array.push(jsonSave);
                }

                var payment_id = serverRequest.parameters.payment_id;
                var objRecord = record.load({
                    type: 'customrecord_sii_custpayment',
                    id: payment_id
                });
                var saving = objRecord.getValue({
                    fieldId: 'custrecord_sii_custpayment_saving'
                });
                if(saving != '' && saving != null){
                    saving = JSON.parse(saving);
                    saving.invoice = array;
                }else{
                    saving = {
                        "invoice": array
                    };
                }
                record.submitFields({
                    type: 'customrecord_sii_custpayment',
                    id: payment_id,
                    values: {
                        custrecord_sii_custpayment_saving: JSON.stringify(saving)
                    }
                });
                var customer = serverRequest.parameters.customer;
                record.submitFields({
                    type: 'customrecord_sii_custpayment',
                    id: payment_id,
                    values: {
                        custrecord_sii_custpayment_client: customer
                    }
                });
              // ���v������Ǘ��[�u�����z�v�ɃZ�b�g
              var paymentamo = serverRequest.parameters.total_text;
              paymentamo = getInt(paymentamo);
              setPaymentAmount(payment_id, paymentamo);

                var head_id = serverRequest.parameters.head_id;
                redirect.toSuitelet({
                    scriptId: 'customscript_sii_sl_paymentmanagement' ,
                    deploymentId: 'customdeploy_sii_sl_paymentmanagement',
                    parameters: {
                      'custscript_custpayment_head_id': head_id
                    }
                });
            }
        }catch(e){
            log.error({
                title: e.name,
                details: e.message
            });
        }
    }

    function getInvoiceList(){
        var mysearch = search.load({
            id: 'customsearch_custpayment_invoice_detail'
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

  /**
   *���v������Ǘ��[�u�����z�v�ɃZ�b�g
   * @param paymentListDetailId
   * @param payment_summary
   */
  function setPaymentAmount(paymentListDetailId, payment_summary) {
    var id = record.submitFields({
      type: 'customrecord_sii_custpayment',
      id: paymentListDetailId,
      values: {
        custrecord_sii_custpayment_paymentamo: payment_summary
      }
    });
  }

  /**
   * 123,456,789 -> 123456789
   * @param stringNumber
   * @returns {number | *}
   */
  function getInt(stringNumber){
    stringNumber = stringNumber.split(",");
    var stringtotal = '';
    stringNumber.forEach(function(item, index){
      stringtotal = stringtotal+item;
    });
    stringNumber = parseInt(stringtotal);
    return stringNumber;
  }

    return {
        onRequest: onRequest
    };
    
});
