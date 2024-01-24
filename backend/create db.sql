CREATE TABLE public.billboards
(
    billboard_id uuid,
    addres character varying(200),
    tasks uuid[],
    PRIMARY KEY (billboard_id)
);

CREATE TABLE public.tasks
(
    task_id uuid,
    name_advert character varying(200),
    date_start timestamp without time zone,
    date_end timestamp without time zone,
    billboard_id uuid,
    PRIMARY KEY (task_id)
)