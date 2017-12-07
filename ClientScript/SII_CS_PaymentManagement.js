/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
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
            sublistId: 'payment_sub_list'
        });
        for (i = 0; i < numLines; i++) {
            check = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_check',
                line : i 
            });
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
        var formDate = currentRecord.getValue({
            fieldId: 'paymentdatefrom'
        });
        var toDate = currentRecord.getValue({
            fieldId: 'paymentdateto'
        });
        if(line != null){
            var check = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_check',
                line : line
            });
            var totalvalue = currentRecord.getValue({
                fieldId: 'texttotal'
            });
            totalvalue = getInt(totalvalue);
            var id = currentRecord.getSublistValue({
                sublistId: 'payment_sub_list',
                fieldId: 'id',
                line: line
            });
            var paymentDate = currentRecord.getSublistValue({ 
                sublistId: 'payment_sub_list',
                fieldId : 'sub_list_4',
                line : line 
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
                var consumptionField = currentRecord.getSublistField({ 
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_11',
                    line: line 
                });
                var amount = currentRecord.getSublistValue({
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_8',
                    line: line
                });
                if(checkDate(paymentDate, formDate, toDate)){
                    totalvalue = totalvalue - amount;
                }
                totalvalue = format.format({
                    value: totalvalue,
                    type: format.Type.INTEGER
                });
                currentRecord.setValue({
                    fieldId: 'texttotal',
                    value: totalvalue
                });
                feeField.isDisabled = true;
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
                var amount = currentRecord.getSublistValue({
                    sublistId: 'payment_sub_list',
                    fieldId: 'sub_list_8',
                    line: line
                });
                if(checkDate(paymentDate, formDate, toDate)){
                    totalvalue = totalvalue + amount;
                }
                totalvalue = format.format({
                    value: totalvalue,
                    type: format.Type.INTEGER
                });
                currentRecord.setValue({
                    fieldId: 'texttotal',
                    value: totalvalue
                });
                feeField.isDisabled = false;
            }
        }else{
            var fieldId = scriptContext.fieldId;
            if(fieldId == 'paymentdatefrom' || fieldId == 'paymentdateto'){
                var numLines = currentRecord.getLineCount({
                    sublistId: 'payment_sub_list'
                });
                totalvalue = 0;
                for (i = 0; i < numLines; i++) {
                    var amount = currentRecord.getSublistValue({
                        sublistId: 'payment_sub_list',
                        fieldId: 'sub_list_8',
                        line: i
                    });
                    var paymentDate = currentRecord.getSublistValue({ 
                        sublistId: 'payment_sub_list',
                        fieldId : 'sub_list_4',
                        line : i 
                    });
                    var check = currentRecord.getSublistValue({ 
                        sublistId: 'payment_sub_list',
                        fieldId : 'sub_list_check',
                        line : i
                    });
                    if(checkDate(paymentDate, formDate, toDate) && !check){
                        totalvalue += amount
                    }
                }
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
