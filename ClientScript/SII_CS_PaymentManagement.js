/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * 入金管理票
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */
define(['N/ui/dialog', 'N/currentRecord','N/search', 'N/ui/message', 'N/file', 'N/record', 'N/format', 'N/url'],

function(dialog,currentRecord,search,message,file,record,format,url) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        var numLines = currentRecord.getLineCount({
            sublistId: 'payment_sub_list'
        });
        for (i = 0; i < numLines; i++) {
            var check = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_check',
                line : i 
            });
            currentRecord.getSublistField({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_2',
                line : i 
            }).isDisabled = true;
            currentRecord.getSublistField({ 
                sublistId: 'payment_sub_list',
                fieldId : 'client_half',
                line : i 
            }).isDisabled = true;
            currentRecord.getSublistField({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_9',
                line : i 
            }).isDisabled = true;
            if(check){
                var matchField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_10',
                    line: i 
                });
                matchField.isDisabled = true;
                var consumptionField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_11',
                    line: i 
                });
                consumptionField.isDisabled = true;
                var feeField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_12',
                    line: i 
                });
                feeField.isDisabled = true;
            }
        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        var id = currentRecord.getValue({ 
            fieldId : 'head_id'
        });
        var line = scriptContext.line;
        var fieldId = scriptContext.fieldId;
        if(scriptContext.fieldId === 'sub_list_check' || scriptContext.fieldId === 'sub_list_10' || scriptContext.fieldId === 'sub_list_11' || scriptContext.fieldId === 'sub_list_12'){
            //除
            var check = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_check',
                line : line
            });
            var totalvalue = currentRecord.getValue({
                fieldId: 'texttotal'
            });
            totalvalue = getInt(totalvalue);
            //入金番号
            var paymentid = currentRecord.getSublistValue({
                sublistId: 'payment_sub_list',
                fieldId: 'id',
                line: line
            });
            //入金日
            var paymentDate = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_4',
                line : line 
            });
            //得意先NO.
            var client = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId: 'sub_list_3',
                line: line 
            });
            //一致
            var match = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId: 'sub_list_10',
                line: line 
            });
            //消費税
            var consumption = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId: 'sub_list_11',
                line: line 
            });
            //手数料
            var fee = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId: 'sub_list_12',
                line: line
            });

            var savingString = {
                'check':check,
                'client':client,
                'match':match,
                'consumption':consumption,
                'fee':fee
            };
            record.submitFields({
                type: 'customrecord_sii_custpayment',
                id: paymentid,
                values: {
                    custrecord_sii_custpayment_saving: JSON.stringify(savingString)
                }
            });

            if(check){
                var matchField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_10',
                    line: line 
                });
                matchField.isDisabled = true;
                var consumptionField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_11',
                    line: line 
                });
                consumptionField.isDisabled = true;
                var feeField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_12',
                    line: line
                });
                feeField.isDisabled = true;
                var amount = currentRecord.getSublistValue({
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_8',
                    line: line
                });
                totalvalue = totalvalue - amount;
                totalvalue = format.format({
                    value: totalvalue,
                    type: format.Type.INTEGER
                });
                currentRecord.setValue({
                    fieldId: 'texttotal',
                    value: totalvalue
                });
            }else{
                var matchField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_10',
                    line: line 
                });
                matchField.isDisabled = false;
                var consumptionField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_11',
                    line: line
                });
                consumptionField.isDisabled = false;
                var feeField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_12',
                    line: line 
                });
                feeField.isDisabled = false;
                var amount = currentRecord.getSublistValue({
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_8',
                    line: line
                });
                totalvalue = totalvalue + amount;
                totalvalue = format.format({
                    value: totalvalue,
                    type: format.Type.INTEGER
                });
                currentRecord.setValue({
                    fieldId: 'texttotal',
                    value: totalvalue
                });
            }
        }
        //「一致」にフラグがあるときは、「消費税」「手数料」にフラグをつけられないようにする。
      //また、「消費税」「手数料」にフラグがあるときは、「一致」にフラグをつけられないようにする
      //※この3つにマークを付けると、「合計金額」が増えていく仕様になっているので修正。
      if(scriptContext.fieldId === 'sub_list_10'){
        var current_match = currentRecord.getSublistValue({
          sublistId: 'payment_sub_list',
          fieldId: 'sub_list_10',
          line: line
        });
        if(current_match){
          currentRecord.getSublistField({
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_11',
            line: line
          }).isDisabled = true;
          currentRecord.getSublistField({
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_12',
            line: line
          }).isDisabled = true;
        }else{
          currentRecord.getSublistField({
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_11',
            line: line
          }).isDisabled = false;
          currentRecord.getSublistField({
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_12',
            line: line
          }).isDisabled = false;
        }
      }
      if(scriptContext.fieldId === 'sub_list_11' || scriptContext.fieldId === 'sub_list_12'){
        var sub_list_11 = currentRecord.getSublistValue({
          sublistId: 'payment_sub_list',
          fieldId: 'sub_list_11',
          line: line
        });
        var sub_list_12 = currentRecord.getSublistValue({
          sublistId: 'payment_sub_list',
          fieldId: 'sub_list_12',
          line: line
        });
        if(sub_list_11 || sub_list_12){
          currentRecord.getSublistField({
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_10',
            line: line
          }).isDisabled = true;
        }else {
          currentRecord.getSublistField({
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_10',
            line: line
          }).isDisabled = false;
        }
      }
      //「顧客」か「誤差認識差額」が変更されたとき、
      // 「マッチング項目が変更されました。更新して情報を再取得しますか？」というメッセージを表示し、
      //［はい］を押下されたときに、上の「更新」ボタンを押下した時と同様の処理をする。
      //「顧客」が変更された場合は、選択された顧客から請求書を取得する。
      // if(scriptContext.fieldId === 'error_difference' || scriptContext.fieldId === 'sub_list_3'){
      //     if (confirm('マッチング項目が変更されました。更新して情報を再取得しますか？')){
      //       alert('ok clicked');
      //     }
      // }
      if(fieldId == 'sub_list_3'){
        //入金番号
        var paymentid = currentRecord.getSublistValue({
            sublistId: 'payment_sub_list',
            fieldId: 'id',
            line: line
        });
        //除
        var check = currentRecord.getSublistValue({ 
            sublistId: 'payment_sub_list',
            fieldId : 'sub_list_check',
            line : line
        });
        var customerId = currentRecord.getSublistValue({ 
          sublistId: 'payment_sub_list',
          fieldId: 'sub_list_3',
          line: line 
        });
        //一致
        var match = currentRecord.getSublistValue({ 
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_10',
            line: line 
        });
        //消費税
        var consumption = currentRecord.getSublistValue({ 
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_11',
            line: line 
        });
        //手数料
        var fee = currentRecord.getSublistValue({ 
            sublistId: 'payment_sub_list',
            fieldId: 'sub_list_12',
            line: line
        });
        if(customerId != '' && customerId != null){
          var invoiceList = getInvoice();
          var claimsum = 0;
          invoiceList.each(function(result) {
            entity = result.getValue(invoiceList.columns[0]);
            amount = result.getValue(invoiceList.columns[1]);
            if(entity == customerId){
              claimsum = parseInt(amount);
              return false;
            }
            return true;
          });
          customerRecord = record.load({
            type: 'customer',
            id: customerId
          });
          var hankakukanaName = customerRecord.getValue({fieldId: 'custentity_hankakukana_name'});
          var entityid = customerRecord.getValue({fieldId: 'entityid'});
          var lineNumber = currentRecord.selectLine({
            "sublistId": "payment_sub_list",
            "line": line
          });
          var claimsumText = format.format({
            value: claimsum,
            type: format.Type.INTEGER
          });
          currentRecord.setCurrentSublistValue({
              "sublistId": "payment_sub_list",
              "fieldId": "sub_list_9",
              "value": claimsumText
          });
          currentRecord.setCurrentSublistValue({
              "sublistId": "payment_sub_list",
              "fieldId": "sub_list_2",
              "value": entityid.split(" ")[0]
          });
          currentRecord.setCurrentSublistValue({
              "sublistId": "payment_sub_list",
              "fieldId": "client_half",
              "value": hankakukanaName
          });
          currentRecord.commitLine({
              "sublistId": "payment_sub_list"
          });
        }else{
          var lineNumber = currentRecord.selectLine({
            "sublistId": "payment_sub_list",
            "line": line
          });
          currentRecord.setCurrentSublistValue({
              "sublistId": "payment_sub_list",
              "fieldId": "sub_list_9",
              "value": '0'
          });
          currentRecord.setCurrentSublistValue({
              "sublistId": "payment_sub_list",
              "fieldId": "sub_list_2",
              "value": ''
          });
          currentRecord.setCurrentSublistValue({
            "sublistId": "payment_sub_list",
            "fieldId": "client_half",
            "value": ''
          });
          currentRecord.commitLine({
            "sublistId": "payment_sub_list"
          });
        }
        var savingString = {
            'check':check,
            'client':customerId,
            'match':match,
            'consumption':consumption,
            'fee':fee
        };
        record.submitFields({
            type: 'customrecord_sii_custpayment',
            id: paymentid,
            values: {
                custrecord_sii_custpayment_saving: JSON.stringify(savingString)
            }
        });
      }
    }

    function getInvoice(){
        var mysearch = search.load({
            id: 'customsearch_sii_custpayment_invoice'
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

    function checkDate(paymentDate, fromDate, toDate){
        if(!isEmpty(fromDate)){
            if(!isEmpty(toDate)){
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
            if(!isEmpty(toDate)){
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
    function isEmpty(stValue) {
        if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
            return true;
        } else {
            return false;
        }
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
    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {
    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {
    	return true;
    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {
    	return true;
    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {
    	return true;
    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {
    	return true;
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	return true;
    }

    function btnClearButton(stringParam) {
      var output = url.resolveRecord({
            recordType: 'customrecord_sii_custpayment_h',
            recordId: stringParam
        });
        window.open(output,"_self");
    }
    function btnSearchButton() {
    	
    }
    function btnReturnButton() {
    	window.history.go(-1);
    }

    function btnUpdateButton(recordId) {
        location.reload();
        /*var output = url.resolveRecord({
            recordType: 'customrecord_sii_custpayment_h',
            recordId: recordId
        });
        window.open(output);*/
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord,
        btnReturnButton: btnReturnButton,
        btnSearchButton: btnSearchButton,
        btnClearButton: btnClearButton,
        btnUpdateButton: btnUpdateButton
    };
    
});
