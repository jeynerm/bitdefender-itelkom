var InitiateExpandableDataTable = function() {
    return {
        init: function() {
            /* Formatting function for row details */
            function fnFormatDetails(oTable, nTr) {
                var aData = oTable.fnGetData(nTr);
                var sOut = '<a href="http://pagos.itelkom.co:3135/pagar?ref='+aData[6]+'" class="btn btn-default btn"><i class="fa fa-credit-card"></i> Pagar en Linea</a>';
				sOut += '<a href="http://itelkom.co/servicios/banco.php" class="btn btn-default" style="margin-left: 10px;"><i class="fa fa-money"></i> Otros medios de pago</a>';
				sOut += '<a href="https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=204&deploy=1&compid=4124568&h=abce12f5eda0b5c772b9&custparam_doc='+aData[7]+'&custparam_pass='+aData[8]+'&custparam_ref='+aData[6]+'" class="btn btn-default" style="margin-left: 10px;"><i class="fa fa-download"></i> Descargar</a>';
                return sOut;
            }

            /*
             * Insert a 'details' column to the table
             */
            var nCloneTh = document.createElement('th');
            var nCloneTd = document.createElement('td');
            nCloneTd.innerHTML = '<i class="glyphicon glyphicon-eye-open row-details"></i>';

            $('#expandabledatatable thead tr').each(function() {
                this.insertBefore(nCloneTh, this.childNodes[0]);
            });

            $('#expandabledatatable tbody tr').each(function() {
                this.insertBefore(nCloneTd.cloneNode(true), this.childNodes[0]);
            });

            /*
             * Initialize DataTables, with no sorting on the 'details' column
             */
            var oTable = $('#expandabledatatable').dataTable({
				"order": [[ 1, "desc" ]],
                "sDom": "Tflt<'row DTTTFooter'<'col-sm-6'i><'col-sm-6'p>>",
                "aoColumnDefs": [
                    { "bSortable": false, "aTargets": [0] },
                    { "bVisible": false, "aTargets": [6,7,8] }
                ],
                "aaSorting": [[1, 'asc']],
                "aLengthMenu": [
                    [5, 15, 20, -1],
                    [5, 15, 20, "All"]
                ],
                "iDisplayLength": 5,
                "oTableTools": {
                    "aButtons": [
                    ],
                    "sSwfPath": "assets/swf/copy_csv_xls_pdf.swf"
                },
                "language": {
                    "search": "",
                    "sLengthMenu": "_MENU_",
                    "oPaginate": {
                        "sPrevious": "Prev",
                        "sNext": "Next"
                    }
                }
            });


            $('#expandabledatatable').on('click', ' tbody td .row-details', function() {
                var nTr = $(this).parents('tr')[0];
                if (oTable.fnIsOpen(nTr)) {
                    /* This row is already open - close it */
                    $(this).addClass("glyphicon-eye-open").removeClass("glyphicon-eye-close");
                    oTable.fnClose(nTr);
                } else {
                    /* Open this row */
                    $(this).addClass("glyphicon-eye-close").removeClass("glyphicon-eye-open");;
                    oTable.fnOpen(nTr, fnFormatDetails(oTable, nTr), 'details');
                }
            });

            $('#expandabledatatable_column_toggler input[type="checkbox"]').change(function() {
                var iCol = parseInt($(this).attr("data-column"));
                var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
                oTable.fnSetColumnVis(iCol, (bVis ? false : true));
            });

            $('body').on('click', '.dropdown-menu.hold-on-click', function(e) {
                e.stopPropagation();
            });
        }
    };
}();