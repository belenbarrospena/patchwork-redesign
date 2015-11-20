var pw = (function() {
    var _this,
        exports = {},
        ctx = {
            project: null
        };

    var columnsMap = {
        'Series': 'name',
        'Patches': 'n_patches',
        'Submitter': 'submitter_name',
        'Reviewer': 'reviewer_name',
        'Submitted': 'submitted',
        'Updated': 'last_updated'
    };

    function series_writer(record) {
        return '<a href="/series/' + record['id'] + '/">' + record[this.id] + '</a>';
    }

    function date_writer(record) {
        return record[this.id].substr(0, 10);
    }

    function reviewer_writer(record) {
        reviewer = record[this.id];
        if (!reviewer)
            return '<em class="text-muted">None</span>';
        else
            return reviewer;
    }

    exports.amend_context = function(new_ctx) {
        $.extend(ctx, new_ctx);
    }

    exports.init = function(init_ctx) {
        _this = this;

        this.amend_context(init_ctx);

        $.dynatableSetup({
            dataset: {
                perPageDefault: 20,
                perPageOptions: [20, 50, 100]
            },
            params: {
                perPage: 'perpage',
                records: 'results',
                queryRecordCount: 'count',
                totalRecordCount: 'count'
            },
            inputs: {
                pageText: '',
                paginationPrev: 'Â« Previous',
                paginationNext: 'Next Â»',
                paginationGap: [1,1,1,1],
            },
            writers: {
                'name': series_writer,
                'submitted': date_writer,
                'last_updated': date_writer,
                'reviewer_name': reviewer_writer
            }
        });
    }

    exports.setup_series_list = function(selector, url) {
        var table = $(selector);
        var url;

        if (typeof url == 'undefined')
            url = '/api/1.0/projects/' + ctx.project + '/series/?ordering=-submitted';

        table.bind('dynatable:preinit', function(e, dynatable) {
            dynatable.utility.textTransform.PatchworkSeries = function(text) {
                return columnsMap[text];
            };
        }).dynatable({
            features: {
                search: false,
                recordCount: false,
            },
            table: {
                defaultColumnIdStyle: 'PatchworkSeries',
            },
            dataset: {
                ajax: true,
                ajaxUrl: url,
                ajaxOnLoad: true,
                records: []
            }
        });

        table.stickyTableHeaders();
    }

    exports.setup_series = function(config) {
        var column_num, column_name;

        column_num = $('#' + config.patches + ' tbody tr td:first-child');
        column_name = $('#' + config.patches + ' tbody tr td:nth-child(2) a');

        for (i = 0; i < column_num.length; i++) {
            var name = $(column_name[i]).html();
            var s = name.split(']');

            if (s.length == 1) {
                $(column_num[i]).html('1');
            } else {
                var matches = s[0].match(/(\d+)\/(\d+)/);

                $(column_name[i]).html(s.slice(1).join(']'));

                if (!matches) {
                    $(column_num[i]).html('1');
                    continue;
                }

                $(column_num[i]).html(matches[1]);
            }
        }
    }

    return exports
}());
