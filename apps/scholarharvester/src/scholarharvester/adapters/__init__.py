from __future__ import annotations

from scholarharvester.adapters.ccc_articulation_pdfs import collect as ccc_articulation_pdfs
from scholarharvester.adapters.ccc_catalog_courses import collect as ccc_catalog_courses
from scholarharvester.adapters.cccco_datamart_transfers import collect as cccco_datamart_transfers
from scholarharvester.adapters.csu_system_dashboards_freshman import collect as csu_system_dashboards_freshman
from scholarharvester.adapters.csu_system_dashboards_transfer import collect as csu_system_dashboards_transfer
from scholarharvester.adapters.uc_info_center_admissions_source_school import collect as uc_info_center_admissions_source_school
from scholarharvester.adapters.uc_info_center_freshman_discipline import collect as uc_info_center_freshman_discipline
from scholarharvester.adapters.uc_info_center_transfers_major import collect as uc_info_center_transfers_major

ADAPTERS: dict[str, callable] = {
    "uc_info_center_transfers_major": uc_info_center_transfers_major,
    "uc_info_center_freshman_discipline": uc_info_center_freshman_discipline,
    "uc_info_center_admissions_source_school": uc_info_center_admissions_source_school,
    "csu_system_dashboards_transfer": csu_system_dashboards_transfer,
    "csu_system_dashboards_freshman": csu_system_dashboards_freshman,
    "cccco_datamart_transfers": cccco_datamart_transfers,
    "ccc_catalog_courses": ccc_catalog_courses,
    "ccc_articulation_pdfs": ccc_articulation_pdfs,
}
