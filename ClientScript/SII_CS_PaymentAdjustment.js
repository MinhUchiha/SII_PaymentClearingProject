/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * 入金管理の編集、誤差調整金額画面
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */
define(['N/ui/dialog', 'N/currentRecord','N/search', 'N/ui/message', 'N/file', 'N/record', 'N/format'],

function(dialog,currentRecord,search,message,file,record,format) {
    
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
            sublistId: 'invoice_sub_list'
        });
        for (i = 0; i < numLines; i++) {
            var no_applicable = currentRecord.getSublistField({ 
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_7',
                line: i 
            });
            no_applicable.isDisabled = true;
          /**
           * 【「調整額」が空欄のとき】
           「費用勘定科目」「消費税」「消費税カテゴリ」を表示しない
           ＝調整額に値があるときは表示する
           or
           「費用勘定科目」「消費税」「消費税カテゴリ」をグレーアウト
           ＝調整額に値があるときはグレーアウトを解除
           */
          var ajust_mount = currentRecord.getSublistValue({
            sublistId: 'invoice_sub_list',
            fieldId: 'sub_list_5',
            line: i
          });
          if(ajust_mount === null || ajust_mount === ''){
            currentRecord.getSublistField({
              sublistId: 'invoice_sub_list',
              fieldId: 'sub_list_8',
              line: i
            }).isDisabled = true;
            currentRecord.getSublistField({
              sublistId: 'invoice_sub_list',
              fieldId: 'sub_list_9',
              line: i
            }).isDisabled = true;
            currentRecord.getSublistField({
              sublistId: 'invoice_sub_list',
              fieldId: 'sub_list_10',
              line: i
            }).isDisabled = true;
          }else {
            currentRecord.getSublistField({
              sublistId: 'invoice_sub_list',
              fieldId: 'sub_list_8',
              line: i
            }).isDisabled = false;
            currentRecord.getSublistField({
              sublistId: 'invoice_sub_list',
              fieldId: 'sub_list_9',
              line: i
            }).isDisabled = false;
            currentRecord.getSublistField({
              sublistId: 'invoice_sub_list',
              fieldId: 'sub_list_10',
              line: i
            }).isDisabled = false;
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
        var line = scriptContext.line;
        var payment_id = currentRecord.getValue({
          fieldId: 'payment_id'
        });
        var numLines = currentRecord.getLineCount({
          sublistId: 'invoice_sub_list'
        });
        if(line != null){
          if(scriptContext.fieldId === 'sub_list_5') {
            /**
             * 【「調整額」が空欄のとき】
             「費用勘定科目」「消費税」「消費税カテゴリ」を表示しない
             ＝調整額に値があるときは表示する
             or
             「費用勘定科目」「消費税」「消費税カテゴリ」をグレーアウト
             ＝調整額に値があるときはグレーアウトを解除
             */
            var ajust_mount = currentRecord.getSublistValue({
              sublistId: 'invoice_sub_list',
              fieldId: 'sub_list_5',
              line: line
            });
            if (ajust_mount === null || ajust_mount === '') {
              currentRecord.getSublistField({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_8',
                line: line
              }).isDisabled = true;
              currentRecord.getSublistField({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_9',
                line: line
              }).isDisabled = true;
              currentRecord.getSublistField({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_10',
                line: line
              }).isDisabled = true;
              //setTotal(payment_id, currentRecord);
            } else {
              currentRecord.getSublistField({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_8',
                line: line
              }).isDisabled = false;
              currentRecord.getSublistField({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_9',
                line: line
              }).isDisabled = false;
              currentRecord.getSublistField({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_10',
                line: line
              }).isDisabled = false;
              //「調整額」に入力した数値は「合計」に加算する
              //setTotal(payment_id, currentRecord);
            }
            var total = currentRecord.getValue({
              fieldId: 'total_text'
            });
            total = getInt(total);
            applicableamount = total;
            var fee = currentRecord.getValue({
              fieldId: 'fee'
            });
            if(!isEmpty(fee)){
              applicableamount = applicableamount - fee;
            }
            var calculation_error = currentRecord.getValue({
              fieldId: 'calculation_error'
            });
            if(!isEmpty(calculation_error)){
              applicableamount = applicableamount - calculation_error;
            }
            for(i = 0; i < numLines; i++){
              var applied = currentRecord.getSublistValue({
                  sublistId: 'invoice_sub_list',
                  fieldId: 'sub_list_4',
                  line: i
              });
              var ajustmount = currentRecord.getSublistValue({
                  sublistId: 'invoice_sub_list',
                  fieldId: 'sub_list_5',
                  line: i
              });
              if(!isEmpty(ajustmount)){
                applicableamount = applicableamount - ajustmount;
              }
              if(!isEmpty(applied)){
                applicableamount = applicableamount - applied;
              }
            }
            var applicable_amount =  format.format({
                value: applicableamount,
                type: format.Type.INTEGER
            });
            currentRecord.setValue({
                "fieldId": "applicable_amount",
                "value": applicable_amount
            });
          }
          if(scriptContext.fieldId === 'sub_list_4') {
            var adjustment = currentRecord.getSublistValue({ 
                sublistId: 'invoice_sub_list',
                fieldId : 'sub_list_5',
                line : line
            });
            var amountremaining = currentRecord.getSublistValue({ 
                sublistId: 'invoice_sub_list',
                fieldId : 'sub_list_3',
                line : line
            });
            var applied = currentRecord.getSublistValue({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_4',
                line: line
            });
            var no_applicable = 0
            if(adjustment != null && adjustment != ''){
                no_applicable = amountremaining - (applied+adjustment);
            }else{
                no_applicable = amountremaining - applied;
            }
            currentRecord.selectLine({
                "sublistId": "invoice_sub_list",
                "line": line
            });
            currentRecord.setCurrentSublistValue({
                "sublistId": "invoice_sub_list",
                "fieldId": "sub_list_7",
                "value": no_applicable.toString()
            });
            currentRecord.commitLine({
                "sublistId": "invoice_sub_list"
            });
            var total = currentRecord.getValue({
              fieldId: 'total_text'
            });
            total = getInt(total);
            applicableamount = total;
            var fee = currentRecord.getValue({
              fieldId: 'fee'
            });
            if(!isEmpty(fee)){
              applicableamount = applicableamount - fee;
            }
            var calculation_error = currentRecord.getValue({
              fieldId: 'calculation_error'
            });
            if(!isEmpty(calculation_error)){
              applicableamount = applicableamount - calculation_error;
            }
            for(i = 0; i < numLines; i++){
              var applied = currentRecord.getSublistValue({
                  sublistId: 'invoice_sub_list',
                  fieldId: 'sub_list_4',
                  line: i
              });
              var ajustmount = currentRecord.getSublistValue({
                  sublistId: 'invoice_sub_list',
                  fieldId: 'sub_list_5',
                  line: i
              });
              if(!isEmpty(ajustmount)){
                applicableamount = applicableamount - ajustmount;
              }
              if(!isEmpty(applied)){
                applicableamount = applicableamount - applied;
              }
            }
            var applicable_amount =  format.format({
                value: applicableamount,
                type: format.Type.INTEGER
            });
            currentRecord.setValue({
                "fieldId": "applicable_amount",
                "value": applicable_amount
            });
          }          
          if(scriptContext.fieldId === 'sub_list_6'){
            var check = currentRecord.getSublistValue({ 
                sublistId: 'invoice_sub_list',
                fieldId : 'sub_list_6',
                line : line
            });
            var fee = currentRecord.getValue({
                fieldId: 'fee'
            });
            var calculation_error = currentRecord.getValue({
                fieldId: 'calculation_error'
            });
            var applied = currentRecord.getSublistValue({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_4',
                line: line
            });
            var no_applicable = currentRecord.getSublistValue({
                "sublistId": "invoice_sub_list",
                "fieldId": "sub_list_7",
                line: line
            });
            if(isEmpty(calculation_error)){
                calculation_error = 0;
            }
            if(isEmpty(fee)){
                fee = 0;
            }
            if(check){
              for(i = 0; i < numLines; i++){
                var checkLine = currentRecord.getSublistValue({ 
                  sublistId: 'invoice_sub_list',
                  fieldId : 'sub_list_6',
                  line : i
                });
                var appliedLine = currentRecord.getSublistValue({
                  sublistId: 'invoice_sub_list',
                  fieldId: 'sub_list_4',
                  line: i
                });
                var no_applicableLine = currentRecord.getSublistValue({
                  "sublistId": "invoice_sub_list",
                  "fieldId": "sub_list_7",
                  line: i
                });
                if(i !== line){
                  if(checkLine){
                    currentRecord.selectLine({
                      "sublistId": "invoice_sub_list",
                      "line": i
                    });
                    currentRecord.setCurrentSublistValue({
                      "sublistId": "invoice_sub_list",
                      "fieldId": "sub_list_6",
                      "value": false
                    });
                    currentRecord.commitLine({
                      "sublistId": "invoice_sub_list"
                    });
                  }
                }
              }
            }
          }
        }
        if(scriptContext.fieldId == 'fee' || scriptContext.fieldId == 'calculation_error'){
          var total = currentRecord.getValue({
            fieldId: 'total_text'
          });
          total = getInt(total);
          applicableamount = total;
          var fee = currentRecord.getValue({
            fieldId: 'fee'
          });
          if(!isEmpty(fee)){
            applicableamount = applicableamount - fee;
          }
          var calculation_error = currentRecord.getValue({
            fieldId: 'calculation_error'
          });
          if(!isEmpty(calculation_error)){
            applicableamount = applicableamount - calculation_error;
          }
          for(i = 0; i < numLines; i++){
            var ajustmount = currentRecord.getSublistValue({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_5',
                line: i
            });
            var check = currentRecord.getSublistValue({ 
                sublistId: 'invoice_sub_list',
                fieldId : 'sub_list_6',
                line : i
            });
            var applied = currentRecord.getSublistValue({
                sublistId: 'invoice_sub_list',
                fieldId: 'sub_list_4',
                line: i
            });
            var no_applicable = currentRecord.getSublistValue({
                "sublistId": "invoice_sub_list",
                "fieldId": "sub_list_7",
                line: i
            });
            if(isEmpty(calculation_error)){
              calculation_error = 0;
            }
            if(isEmpty(fee)){
              fee = 0;
            }
            if(!isEmpty(applied)){
              applicableamount = applicableamount - applied;
            }
            if(!isEmpty(ajustmount)){
              applicableamount = applicableamount - ajustmount;
            }
          }
          var applicable_amount =  format.format({
            value: applicableamount,
            type: format.Type.INTEGER
          });
          currentRecord.setValue({
            "fieldId": "applicable_amount",
            "value": applicable_amount
          });
        }
    }

    function setTotal(paymentId, currentRecord){
      var paymentRecord = record.load({
        type: 'customrecord_sii_custpayment',
        id: paymentId
      });
      var paymentamo = paymentRecord.getValue({
        fieldId: 'custrecord_sii_custpayment_paymentamo'
      });
      var numLines = currentRecord.getLineCount({
        sublistId: 'invoice_sub_list'
      });
      for (i = 0; i < numLines; i++) {
        var ajust_mount = currentRecord.getSublistValue({
          sublistId: 'invoice_sub_list',
          fieldId: 'sub_list_5',
          line: i
        });
        if(isEmpty(ajust_mount)){
          ajust_mount = 0;
        }
        paymentamo = paymentamo + parseInt(ajust_mount) ;
        var count_total_text = format.format({
          value: paymentamo,
          type: format.Type.INTEGER
        });
        currentRecord.setValue({
          fieldId: 'total_text',
          value: count_total_text
        });
      }
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
//    	dialog.alert({
//  			message: stringParam
//  		});
    	
    }
    function btnSearchButton() {
    	
    }
    function btnReturnButton() {
    	window.history.go(-1);
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
        btnClearButton: btnClearButton
    };
    
});
